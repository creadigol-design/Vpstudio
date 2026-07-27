# device-gateway (planned — Phase 1/4)

Real-time channel between studio capture agents and the platform: WebSocket
session for live device status, teleprompter coordination, remote actions
(restart agent, retry uploads, maintenance mode — spec §10.2) and agent
update orchestration. The current REST heartbeat in `services/api` is the
interim path; this service takes over when fleet size demands it.
