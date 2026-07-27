# media-ingest (planned — Phase 2)

Validates uploaded media and prepares it for the pipeline (spec §17): file
integrity, duration and codec metadata via `ffprobe`, corrupt-media detection,
preview image and proxy generation, and triggering downstream processing.

Consumes upload-complete events; writes `MediaAsset.technicalMetadata` and
`validationStatus`. Local studio media is only cleaned up after cloud
validation succeeds (spec §16.2).
