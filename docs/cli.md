# CLI

The `skyhost` command deploys and manages your services from a terminal or a CI pipeline.
Source: [`cli/`](../cli) (MIT).

## Install

| OS | Command |
| --- | --- |
| macOS / Linux | `curl -fsSL https://raw.githubusercontent.com/INCONNU-BOY-SENSEI/skyhost/main/install.sh \| sh` |
| Windows (PowerShell) | `irm https://raw.githubusercontent.com/INCONNU-BOY-SENSEI/skyhost/main/install.ps1 \| iex` |
| npm (any OS) | `npm install -g github:INCONNU-BOY-SENSEI/skyhost` |

Requirements: **Node.js 18+**. The installer puts a single file in `~/.skyhost/bin` and adds it to your `PATH`.
Run the same command again to update. Pin a version with `SKYHOST_VERSION=<tag>`; change the folder with
`SKYHOST_INSTALL_DIR=<dir>`.

Uninstall: delete `~/.skyhost` (and `~/.config/skyhost` for the credentials), or `npm uninstall -g skyhost-cli`.

## Sign in

```bash
skyhost login              # opens the browser; approve the code shown in the terminal
skyhost login --no-browser # prints the URL instead (SSH sessions, servers)
skyhost login --token sky_xxx   # use an API key (CI)
skyhost whoami
skyhost logout
```

The browser flow creates an API key for this device. Credentials are stored in
`~/.config/skyhost/config.json` with `0600` permissions. Revoke a device any time in
**Account → API keys**.

## Link a folder

Most commands act on the service *linked* to the current folder (stored in `.skyhost/project.json`, ignored
by git).

```bash
skyhost init [--name my-app] [--type web|worker|static]   # new project from this folder, then deploy
skyhost link [--project P] [--service S] [--environment E] # link to an existing service
skyhost unlink
skyhost status            # services, status and URLs of the project
skyhost projects          # every project of your team
```

## Deploy

```bash
skyhost deploy [--detach]   # zip, upload and deploy this folder; streams the logs (alias: skyhost up)
skyhost redeploy            # redeploy the live version (after changing variables)
skyhost deployments         # recent deployments
skyhost rollback [ID]       # previous successful version, or a given one
skyhost open                # open the live URL
```

What gets uploaded: everything except `.git`, `node_modules`, `.env` / `.env.*` (but `.env.example` is kept),
`*.pem`, `*.key`, `__pycache__`, virtualenvs, build caches, and whatever your `.gitignore` and
`.skyhostignore` list. Limit: 100 MB compressed.

When a deployment fails, the CLI prints the diagnosis — problem, cause and fix — and **the previous version
stays live**.

## Logs and shell

```bash
skyhost logs                      # recent runtime logs
skyhost logs -f                   # follow
skyhost logs --tail 500
skyhost logs --deployment 1a2b3c  # build/deploy logs of one deployment
skyhost shell                     # interactive shell inside the running container
skyhost shell -c "npx prisma migrate deploy"
```

## Variables

```bash
skyhost env list [--reveal]
skyhost env set NODE_ENV=production API_URL=https://api.example.com
skyhost env set STRIPE_KEY=sk_live_… --secret   # hidden in the dashboard and logs
skyhost env unset OLD_KEY
skyhost redeploy                                # apply them
```

## Databases

```bash
skyhost db create postgres [NAME]       # also: mariadb, mongodb, redis
skyhost db create redis --no-connect    # don't inject the URL into this service
skyhost db list
```

The connection URL is added to the linked service automatically (`DATABASE_URL`, `MONGODB_URI` or `REDIS_URL`).

## Environment variables of the CLI

| Variable | Use |
| --- | --- |
| `SKYHOST_TOKEN` | API key — skips `skyhost login` (CI) |
| `SKYHOST_TEAM_ID` | Team to use with `SKYHOST_TOKEN` when the key is not bound to a team |
| `SKYHOST_API_URL` | API address (default `https://skyhost.tech`) |
| `SKYHOST_CONFIG_DIR` | Where credentials are stored |
| `NO_COLOR` | Disable colours |

## Exit codes

`0` success · `1` error (including a failed deployment) · `2` invalid arguments.
