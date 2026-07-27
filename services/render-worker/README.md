# render-worker (planned — Phase 2)

Containerised workers that fetch a composition manifest, download and
checksum-verify assets, render with FFmpeg plus a component-based graphics
renderer (Remotion or equivalent), upload outputs and record progress
(spec §22.2). Jobs are resumable and idempotent; workers scale on queue
depth and priority tier (spec §22.3). Must not run inside short-limit
serverless functions (spec §7.9).
