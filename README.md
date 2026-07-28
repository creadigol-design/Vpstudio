# Virtual Studio

A self-service virtual studio platform: multi-tenant SaaS with managed studio hardware that lets non-technical clients record, assemble, review and export professional branded video content — without a production team for every session.

The core promise:

> **Select a format, add your content, record each section, review the draft and publish.**

The first release focuses on one repeatable workflow:

> **A single presenter records a branded update in a fixed studio and receives an automatically assembled landscape and vertical video.**

## Documentation

- **[Technical Product Brief / Master Specification](docs/virtual-studio-platform-spec.md)** — the build-ready specification covering product goals, user groups, system architecture, technology stack, the local capture agent, hardware requirements, the automated post-production pipeline, template and brand systems, review and approval workflows, security, compliance, MVP scope, delivery phases and acceptance criteria.

## Platform at a glance

The system consists of five primary layers:

```
Studio Hardware
      │
      ▼
Local Capture Agent
      │
      ▼
Client Web Application
      │
      ▼
Cloud Application and Media Services
      │
      ▼
Storage, Rendering and Distribution
```

Key characteristics:

- **Guided, not open-ended** — clients start from approved programme templates, never an empty timeline.
- **Capture locally, process centrally** — high-quality source media is recorded on the studio machine and uploaded via resumable multipart uploads; assembly, captions, audio processing and rendering happen in the cloud.
- **Brand safety by design** — organisation brand kits with locked elements that creators cannot break.
- **Reversible automation** — automated edits are visible and recoverable; source media is never overwritten.
- **Bilingual from the start** — English and Welsh supported at the data-model, interface and caption level.

## Delivery phases

| Phase | Focus |
|---|---|
| 0 | Discovery and proof of concept |
| 1 | Studio capture appliance |
| 2 | Automated production pipeline |
| 3 | Client platform (multi-tenant, review, approval) |
| 4 | Operational platform (billing, fleet, support) |
| 5 | Remote recording |
| 6 | Advanced automation |

See [section 41 of the specification](docs/virtual-studio-platform-spec.md#41-delivery-phases) for detail.

## Repository structure

The monorepo follows the layout defined in [section 47 of the specification](docs/virtual-studio-platform-spec.md#47-recommended-repository-structure). Implemented so far:

| Path | Status | Contents |
|---|---|---|
| `packages/contracts` | ✅ built | Shared domain schemas (zod): project status machine with validated transitions, upload states, running-order model + structural validation, roles/permissions, QC output shapes, languages, output presets |
| `packages/database` | ✅ built | Prisma schema for all §27 entities with tenant fields, singleton client, dev seed (demo org, role users, §46 "Presenter update" template) |
| `packages/i18n` | ✅ built | English and Welsh interface catalogs with typed lookup; tests enforce catalog parity |
| `packages/storage` | ✅ built | S3/MinIO client, presigned multipart helpers, tenant-scoped storage-key layout per media category |
| `packages/queues` | ✅ built | BullMQ queue names, typed job payloads, Redis connection helpers |
| `packages/media-utils` | ✅ built | `ffprobe` inspection and `ffmpeg` execution wrappers (tested against synthesized media) |
| `services/api` | ✅ built | NestJS backend: JWT auth, tenant isolation via membership resolution (`x-organisation-id`), RBAC guards, projects (status machine + running-order gate + audit trail), bilingual script versioning, workspaces, templates, brand-safe template versioning, device registration + heartbeat, resumable multipart uploads, recording sessions/takes, project versions + render queueing, review comments, rule-based approvals (one named / any of group / all required), approval-gated export downloads |
| `apps/client-web` | ✅ built | Next.js app: sign-in, project dashboard, creation wizard (template/language/formats), project detail with running order, en/cy script editing and status actions; full en/cy interface toggle |
| `services/media-ingest` | ✅ built | Ingestion worker: ffprobe validation via signed URLs, technical metadata, upload-session completion |
| `services/render-worker` | ✅ built | Draft render worker: title cards, take assembly, landscape + vertical outputs, evidence-based QC rows |
| `services/*` (rest of pipeline) | 📋 planned | READMEs describing transcription, audio-processing, composition, quality-control, notifications, device-gateway |
| `apps/capture-agent` | 📋 planned | Tauri-based studio appliance (Phase 1) |
| `apps/admin-web` | 📋 planned | Operations console (Phase 4) |
| `infrastructure` | ✅ built | docker-compose for local Postgres, Redis and MinIO |

## Getting started

```bash
pnpm install
docker compose -f infrastructure/docker-compose.yml up -d postgres

# Database
export DATABASE_URL=postgresql://virtualstudio:virtualstudio@localhost:5432/virtualstudio
pnpm --filter @virtual-studio/database generate
pnpm --filter @virtual-studio/database exec prisma db push
pnpm --filter @virtual-studio/database seed   # demo users, password: demo-password

# Run
pnpm build
pnpm dev:api   # API on :4000
pnpm dev:web   # web app on :3000

# Verify
pnpm test
```

Seeded demo accounts: `admin@`, `creator@`, `reviewer@`, `presenter@` `demo.example` (password `demo-password`), demonstrating the §4 role model.
