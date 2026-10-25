# Examples

| Folder | What | Deploy |
| --- | --- | --- |
| [`nextjs-postgres`](nextjs-postgres) | Next.js app with a PostgreSQL database | `skyhost init` then `skyhost db create postgres` |
| [`express-redis`](express-redis) | Express API counting hits in Redis | `skyhost init` then `skyhost db create redis` |
| [`python-fastapi`](python-fastapi) | FastAPI service | `skyhost init` |
| [`vite-react`](vite-react) | Static site built with Vite + React | `skyhost init --type static` |
| [`static-site`](static-site) | One HTML file | `skyhost init --type static` |
| [`whatsapp-bot`](whatsapp-bot) | WhatsApp bot (Baileys) — answers "ping" | `skyhost init --type worker`, then set **Deployment strategy → Recreate** and add a volume at `/app/session` |
| [`webhook-receiver`](webhook-receiver) | Verifies SKYHOST webhook signatures | `skyhost init`, then `skyhost env set SKYHOST_WEBHOOK_SECRET=whsk_… --secret` |
| [`api`](api) | API scripts: shell (`deploy.sh`), Node.js (`skyhost.mjs`), Python (`skyhost.py`) | Run locally with `SKYHOST_TOKEN` |
| [`github-actions`](github-actions) | Workflows: deploy with the CLI, or with a deploy hook | Copy to `.github/workflows/` |

Every app listens on `PORT` and `0.0.0.0` — the one rule for web services on SKYHOST.
