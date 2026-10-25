# Troubleshooting

When a deployment fails, the deployment page (and `skyhost deploy`) shows the probable cause and a suggested
fix. **The previous version stays live** until a new one passes its health check.

## Bad Gateway (502) / health check failed

Your app runs but SKYHOST cannot reach it.

- Listen on `process.env.PORT` **and** on `0.0.0.0` — not `localhost` or `127.0.0.1`.
- Check that the port in Service → Settings matches the one your app prints in its logs.

## The build fails

- **Module not found** — the dependency is missing from `package.json` / `requirements.txt`, or it is in
  `devDependencies` while needed at runtime.
- **Out of memory** — large front-end builds need more memory: upgrade the plan or reduce the build (e.g.
  disable source maps).
- **Wrong folder** — in a monorepo, set the **Root directory** to the app folder.

## The app keeps restarting (crash loop)

Open **Logs** (`skyhost logs`): the error is usually in the last lines. Missing environment variables and an
unreachable database are the usual causes.

## My WhatsApp / Discord bot fails to redeploy

Bots that keep a session cannot run two copies at once. Set **Deployment strategy → Recreate** in the service
settings, and keep the session in a **volume**. See [configuration](configuration.md#deployment-strategy).

## "Not secure" / certificate pending

Certificates are issued once DNS points to SKYHOST; a new address can take a minute. For custom domains, see
[domains](domains.md).

## Changes do not appear

Check the deployment is **Live**. Static sites may be cached by your browser: reload with `Ctrl+Shift+R`.

## CLI

| Message | Fix |
| --- | --- |
| `You are not logged in` | `skyhost login` (or set `SKYHOST_TOKEN`) |
| `This directory is not linked` | `skyhost link` or `skyhost init` |
| `Not authenticated (or the API key was revoked)` | The key was revoked: `skyhost login` again |
| `The archive is … MB; the upload limit is 100 MB` | Add a `.skyhostignore` (same syntax as `.gitignore`) |

## Still stuck?

[Open a support ticket](https://skyhost.tech/support) with the project and service name and what you expected
to happen.
