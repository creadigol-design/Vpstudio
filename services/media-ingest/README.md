# media-ingest

Ingestion worker (spec §17). Consumes `media-ingest` queue jobs enqueued when
a multipart upload completes: probes the object with `ffprobe` via a signed
URL, records codec/stream metadata and duration on `MediaAsset`, marks it
`VALID` or `CORRUPT`, and moves the `UploadSession` to `COMPLETE` or `FAILED`.
The capture agent keeps local media until the session reaches `COMPLETE`
(spec §16.2).

```bash
REDIS_URL=redis://localhost:6379 \
DATABASE_URL=postgresql://virtualstudio:virtualstudio@localhost:5432/virtualstudio \
S3_ENDPOINT=http://localhost:9000 pnpm --filter @virtual-studio/media-ingest dev
```
