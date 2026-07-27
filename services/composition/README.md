# composition (planned — Phase 2)

Builds the deterministic composition manifest for a project version
(spec §22.1): selected takes assembled per the running order, brand graphics,
lower-thirds, opening/closing titles, and template-controlled vertical
layouts (spec §22.5). The manifest is stored on `ProjectVersion.renderManifest`
and handed to render workers.
