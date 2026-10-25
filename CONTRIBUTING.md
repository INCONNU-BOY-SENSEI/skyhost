# Contributing

Thanks for helping! This repository holds the SKYHOST CLI, the public documentation and examples.

- **Doc fixes and new examples** — open a pull request; keep examples small, runnable, and listening on
  `PORT` / `0.0.0.0`.
- **CLI changes** — work in [`cli/`](cli): `npm install && npm run typecheck && npm test && npm run build`,
  and commit `cli/dist/skyhost.js` with your change.
- **Platform bugs or feature requests** (the dashboard, deployments, billing) — use
  [skyhost.tech/support](https://skyhost.tech/support).
- **Security** — see [SECURITY.md](SECURITY.md), never a public issue.

The API reference in `docs/api/reference.md` and `openapi/skyhost.openapi.json` are generated from the
platform; please report mistakes in an issue rather than editing them by hand.
