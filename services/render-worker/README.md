# render-worker

Draft render worker (spec §22). Consumes `render` queue jobs: loads the
deterministic composition manifest from `ProjectVersion.renderManifest`,
downloads the accepted-take sources, renders branded title cards, normalises
every scene to the output geometry (scale + pad, template-controlled — no
blind cropping, spec §22.5), concatenates, and uploads landscape/vertical
drafts to the `drafts/` prefix. Records `RenderJob` progress and evidence-based
`QualityCheck` rows (duration, resolution, audio presence — spec §25.3),
and cleans its temporary storage.

Graphics composition beyond title cards (lower-thirds, branded panels) joins
in a later phase via a component-based renderer (spec §7.8).

```bash
REDIS_URL=redis://localhost:6379 \
DATABASE_URL=postgresql://virtualstudio:virtualstudio@localhost:5432/virtualstudio \
S3_ENDPOINT=http://localhost:9000 pnpm --filter @virtual-studio/render-worker dev
```
