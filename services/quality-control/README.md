# quality-control (planned — Phase 2)

Automated technical and content checks on draft renders (spec §25): black or
frozen frames, audio presence/clipping/loudness, caption overlap and safe-area
violations, missing assets, required brand elements. Every check returns
measured vs expected values with severity and evidence — no fabricated
confidence scores (spec §3.7). Results are stored per `QualityCheck` row and
gate export.
