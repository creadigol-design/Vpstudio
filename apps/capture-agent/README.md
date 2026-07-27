# capture-agent (planned — Phase 1)

Desktop application installed on each managed studio computer (spec §8).
Recommended implementation: Tauri with a Rust core, TypeScript UI and native
FFmpeg integration.

Responsibilities: device registration, hardware detection and pre-flight
checks, local high-quality recording, proxy generation, teleprompter,
take management, resumable chunked upload with local retention until cloud
validation, encrypted local state, diagnostics and self-update.

Exposes a localhost-only API (spec §8.4) consumed by the client web app:
session-token auth, origin validation, no external network exposure.
Registers with the platform using the device registration key issued by
`POST /v1/devices` and reports status via `POST /v1/devices/heartbeat`.
