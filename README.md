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

## Planned repository structure

As the implementation begins, the repository will follow the monorepo layout defined in [section 47 of the specification](docs/virtual-studio-platform-spec.md#47-recommended-repository-structure): `/apps` (client web, admin web, capture agent), `/services` (API, media pipeline, render workers), `/packages` (shared libraries), `/infrastructure` and `/docs`.
