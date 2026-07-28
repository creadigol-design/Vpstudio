import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { canTransitionUpload, type UploadState } from "@virtual-studio/contracts";
import { ObjectStorage, buildStorageKey } from "@virtual-studio/storage";
import { QUEUES, createQueue, type MediaIngestJob } from "@virtual-studio/queues";
import type { Queue } from "bullmq";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

export const CreateUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(255),
  sizeBytes: z.number().int().positive(),
  partCount: z.number().int().min(1).max(10_000),
  kind: z.enum(["CAMERA_MASTER", "PRESENTER_AUDIO", "BACKUP_AUDIO", "PROXY", "USER_ASSET"]),
  projectId: z.string().optional(),
  takeId: z.string().optional(),
  checksum: z.string().optional(),
});
export type CreateUploadDto = z.infer<typeof CreateUploadSchema>;

export const CompleteUploadSchema = z.object({
  parts: z.array(z.object({ partNumber: z.number().int().min(1), etag: z.string().min(1) })).min(1),
});
export type CompleteUploadDto = z.infer<typeof CompleteUploadSchema>;

export const RetryPartsSchema = z.object({
  partNumbers: z.array(z.number().int().min(1)).min(1).max(1000),
});
export type RetryPartsDto = z.infer<typeof RetryPartsSchema>;

@Injectable()
export class UploadsService {
  // Instantiated here rather than injected so Nest does not try to resolve
  // them; tests can override via the internal setters below.
  private storage: ObjectStorage = new ObjectStorage();
  private ingestQueue: Queue<MediaIngestJob> = createQueue<MediaIngestJob>(QUEUES.MEDIA_INGEST);

  constructor(private readonly prisma: PrismaService) {}

  /** @internal test hook */
  useDependencies(storage: ObjectStorage, ingestQueue: Queue<MediaIngestJob>): void {
    this.storage = storage;
    this.ingestQueue = ingestQueue;
  }

  /**
   * Creates an upload session (spec §16.2 steps 1-2): a MediaAsset record, an
   * S3 multipart upload, and presigned URLs for every part. The agent uploads
   * parts directly to object storage; nothing streams through the API.
   */
  async create(tenant: TenantContext, dto: CreateUploadDto) {
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, organisationId: tenant.organisationId },
        select: { id: true },
      });
      if (!project) throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });
    }
    if (dto.takeId) {
      const take = await this.prisma.take.findFirst({
        where: { id: dto.takeId, organisationId: tenant.organisationId },
        select: { id: true },
      });
      if (!take) throw new NotFoundException({ error: "TAKE_NOT_FOUND" });
    }

    const asset = await this.prisma.mediaAsset.create({
      data: {
        organisationId: tenant.organisationId,
        projectId: dto.projectId,
        takeId: dto.takeId,
        kind: dto.kind,
        fileName: dto.fileName,
        contentType: dto.contentType,
        sizeBytes: BigInt(dto.sizeBytes),
        checksum: dto.checksum,
        storageKey: "pending", // replaced below once the asset id exists
      },
    });
    const storageKey = buildStorageKey("raw", tenant.organisationId, asset.id, dto.fileName);
    await this.prisma.mediaAsset.update({ where: { id: asset.id }, data: { storageKey } });

    const s3UploadId = await this.storage.createMultipartUpload(storageKey, dto.contentType);
    const session = await this.prisma.uploadSession.create({
      data: {
        organisationId: tenant.organisationId,
        mediaAssetId: asset.id,
        state: "UPLOADING",
        totalParts: dto.partCount,
        s3UploadId,
      },
    });

    const partUrls = await Promise.all(
      Array.from({ length: dto.partCount }, (_, i) =>
        this.storage.presignUploadPart(storageKey, s3UploadId, i + 1).then((url) => ({ partNumber: i + 1, url })),
      ),
    );

    return {
      uploadSessionId: session.id,
      mediaAssetId: asset.id,
      storageKey,
      state: session.state,
      parts: partUrls,
    };
  }

  /** Fresh presigned URLs for failed parts — resume support (spec §16.1). */
  async retryParts(tenant: TenantContext, sessionId: string, dto: RetryPartsDto) {
    const session = await this.getOwnedSession(tenant, sessionId);
    if (session.state === "COMPLETE" || session.state === "CANCELLED") {
      throw new ConflictException({ error: "UPLOAD_NOT_RESUMABLE", state: session.state });
    }
    if (!session.s3UploadId) throw new BadRequestException({ error: "NO_MULTIPART_UPLOAD" });
    this.transition(session.state as UploadState, "UPLOADING");
    await this.prisma.uploadSession.update({ where: { id: session.id }, data: { state: "UPLOADING" } });
    const urls = await Promise.all(
      dto.partNumbers.map((partNumber) =>
        this.storage
          .presignUploadPart(session.mediaAsset.storageKey, session.s3UploadId!, partNumber)
          .then((url) => ({ partNumber, url })),
      ),
    );
    return { uploadSessionId: session.id, parts: urls };
  }

  /**
   * Completes the multipart upload and hands the asset to ingestion
   * (spec §16.2 steps 7-8). Local media must be retained by the agent until
   * validation succeeds — completion here does not mean verified.
   */
  async complete(tenant: TenantContext, sessionId: string, dto: CompleteUploadDto) {
    const session = await this.getOwnedSession(tenant, sessionId);
    this.transition(session.state as UploadState, "VERIFYING");
    if (!session.s3UploadId) throw new BadRequestException({ error: "NO_MULTIPART_UPLOAD" });

    await this.storage.completeMultipartUpload(session.mediaAsset.storageKey, session.s3UploadId, dto.parts);
    const updated = await this.prisma.uploadSession.update({
      where: { id: session.id },
      data: { state: "VERIFYING", completedParts: dto.parts.length },
    });

    await this.ingestQueue.add(
      "ingest",
      { mediaAssetId: session.mediaAssetId, uploadSessionId: session.id },
      { jobId: `ingest-${session.id}` }, // idempotent enqueue (spec §16.1)
    );
    return { uploadSessionId: updated.id, state: updated.state };
  }

  async abort(tenant: TenantContext, sessionId: string) {
    const session = await this.getOwnedSession(tenant, sessionId);
    this.transition(session.state as UploadState, "CANCELLED");
    if (session.s3UploadId) {
      await this.storage.abortMultipartUpload(session.mediaAsset.storageKey, session.s3UploadId).catch(() => undefined);
    }
    const updated = await this.prisma.uploadSession.update({
      where: { id: session.id },
      data: { state: "CANCELLED" },
    });
    return { uploadSessionId: updated.id, state: updated.state };
  }

  /** Admin observability (spec §16.1): every upload visible with state. */
  list(tenant: TenantContext) {
    return this.prisma.uploadSession.findMany({
      where: { organisationId: tenant.organisationId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        mediaAsset: {
          select: { id: true, fileName: true, kind: true, validationStatus: true, projectId: true, takeId: true },
        },
      },
    });
  }

  private async getOwnedSession(tenant: TenantContext, sessionId: string) {
    const session = await this.prisma.uploadSession.findFirst({
      where: { id: sessionId, organisationId: tenant.organisationId },
      include: { mediaAsset: true },
    });
    if (!session) throw new NotFoundException({ error: "UPLOAD_SESSION_NOT_FOUND" });
    return session;
  }

  private transition(from: UploadState, to: UploadState): void {
    if (!canTransitionUpload(from, to)) {
      throw new ConflictException({ error: "INVALID_UPLOAD_TRANSITION", from, to });
    }
  }
}
