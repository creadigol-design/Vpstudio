import { Queue, Worker, type ConnectionOptions, type Processor } from "bullmq";

/** Queue names for the media pipeline (spec §18). */
export const QUEUES = {
  MEDIA_INGEST: "media-ingest",
  RENDER: "render",
} as const;
export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/** Job payloads. Jobs must be idempotent and resumable (spec §18.2). */
export interface MediaIngestJob {
  mediaAssetId: string;
  uploadSessionId: string;
}

export interface RenderJobPayload {
  renderJobId: string;
  projectVersionId: string;
}

export function redisConnection(): ConnectionOptions {
  const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
  };
}

export function createQueue<T>(name: QueueName): Queue<T> {
  return new Queue<T>(name, {
    connection: redisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: false,
    },
  });
}

export function createWorker<T>(name: QueueName, processor: Processor<T>, concurrency = 2): Worker<T> {
  return new Worker<T>(name, processor, { connection: redisConnection(), concurrency });
}
