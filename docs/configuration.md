# App configuration

SKYHOST needs no config file: SmartDeploy reads your project and proposes the settings. Everything it detects
can be changed in **Service → Settings** or through the API (`PATCH /api/v1/services/{id}`).

## Service types

| Type | For | Public URL |
| --- | --- | --- |
| `web` | Websites and APIs listening on a port | ✅ |
| `static` | Plain HTML or a front-end build (Vite, CRA…), served with HTTPS, compression and an SPA fallback | ✅ |
| `docker` | Any Docker image | ✅ |
| `worker` | Bots, queue consumers — anything that runs continuously without a port | — |
| `cron` | A command run on a schedule (`0 3 * * *` = every day at 03:00 UTC) | — |

## Runtimes

| Runtime | Detected from | Notes |
| --- | --- | --- |
| **Node.js** | `package.json` | Package manager follows your lockfile (npm, pnpm, Yarn, Bun). Runs `build` if present, then `start`. Next.js, Nuxt, SvelteKit, Astro, Express, NestJS… are recognised. Pin Node with `engines.node`. |
| **Python** | `requirements.txt`, `pyproject.toml`, `Pipfile` | Django, Flask, FastAPI and Streamlit get a suitable start command. For Django, add your SKYHOST address to `ALLOWED_HOSTS`. |
| **PHP** | `composer.json` | Laravel and Symfony. Set `APP_KEY` and the database variables. |
| **Go** | `go.mod` | |
| **Static** | `index.html` or a front-end build output | |
| **Docker** | `Dockerfile` | Built as is. Expose the port your app listens on, or read `PORT`. |

Without a Dockerfile, SKYHOST generates one (multi-stage build, non-root user). In a monorepo, set the
**Root directory** to the app's folder.

## Port and health check

Web services receive `PORT`; listen on it and on `0.0.0.0`. A new version only receives traffic once it
answers its health check (the path is configurable, default `/`).

## Environment variables

Add them in **Service → Variables** (one by one, or paste a whole `.env`), with `skyhost env set`, or with
`PUT /api/v1/environments/{id}/variables`. Values are encrypted; **secret** variables are hidden in the dashboard
and redacted from logs. They are available both at build time and at runtime.

**References** point to another service or database of the project and are resolved at deploy time:

```dotenv
DATABASE_URL=${{db.DATABASE_URL}}
API_URL=https://${{api.SKYHOST_PUBLIC_DOMAIN}}
```

**Set by SKYHOST** on every service:

| Variable | Example |
| --- | --- |
| `PORT` | `3000` — listen on it (web services) |
| `SKYHOST_SERVICE`, `SKYHOST_SERVICE_ID`, `SKYHOST_PROJECT_ID` | the service slug and IDs |
| `SKYHOST_ENVIRONMENT` | `production` |
| `SKYHOST_PUBLIC_DOMAIN`, `SKYHOST_PUBLIC_URL` | `my-app.skyhost.tech`, `https://my-app.skyhost.tech` |
| `SKYHOST_PRIVATE_DOMAIN` | address on the project's private network |
| `SKYHOST_DEPLOYMENT_ID`, `SKYHOST_GIT_COMMIT_SHA` | the running release |

Shared variables and variable groups (project settings) apply to several services; a value set on the service
itself always wins.

## Deployment strategy

| Strategy | Behaviour | Use for |
| --- | --- | --- |
| **Rolling** (default) | The new version starts and passes its health check *before* traffic switches. Zero downtime. | Almost everything |
| **Recreate** | The old version stops *before* the new one starts (a few seconds of downtime). If the new one fails, the old one is restarted. | Single-instance stateful apps — e.g. **WhatsApp / Baileys bots**, which cannot run two copies on one session |

## Persistent files

Containers are replaced on every deploy. Files that must survive (uploads, a WhatsApp session, SQLite) go in a
**volume**: Service → Volumes, or `POST /api/v1/services/{id}/volumes`.

## Environments and previews

Each project starts with `production`. Add `staging` or other environments (each with its own variables and
URL); pull requests can get their own preview environment when enabled.

## Releases

- **Rollback** to any previous successful version (dashboard, `skyhost rollback`, or the API).
- **Canary**: send a percentage of traffic to a new version, then promote or abort.
- **Maintenance page**: answer visitors with HTTP 503 and your message while the app keeps running.
- **Deploy freeze**: team admins can block deployments during a period.
