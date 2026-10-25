# SKYHOST API

Everything you can do in the dashboard can be automated with the REST API.

| | |
| --- | --- |
| Base URL | `https://skyhost.tech/api/v1` |
| Format | JSON in, JSON out (`Content-Type: application/json`) |
| Auth | `Authorization: Bearer sky_<prefix>_<secret>` |
| Reference | [reference.md](reference.md) — 164 endpoints |
| Explorer | [skyhost.tech/api/docs](https://skyhost.tech/api/docs) |
| OpenAPI 3 | [`openapi/skyhost.openapi.json`](../../openapi/skyhost.openapi.json) — import it into Postman, Insomnia, or generate a client |

## Authentication

1. Create a key in **[Account → API keys](https://skyhost.tech/account?tab=apikeys)** (or `POST /api-keys`).
   Pick the narrowest scope: `read`, `deploy`, `write` or `admin` (see [scopes](../ci-cd.md#api-key-scopes)).
   A key can be limited to one team, project or service, and can expire.
2. The secret is shown **once**. Store it in a secret manager or a CI secret.
3. Send it on every request:

```bash
curl -H "Authorization: Bearer $SKYHOST_TOKEN" https://skyhost.tech/api/v1/auth/me
```

A key can never do more than the user who created it. Rotate (`POST /api-keys/{id}/rotate`) or revoke
(`POST /api-keys/{id}/revoke`) keys at any time.

## Core objects

```text
Team ─┬─ Project ─┬─ Environment (production, staging, previews)
      │           ├─ Service (web · static · worker · cron · docker) ── Deployment ── Logs
      │           ├─ Database (postgres · mariadb · mongodb · redis) ── Backups
      │           └─ Bucket (S3-compatible storage)
      ├─ Members, API keys, Webhooks, Notification channels
```

A **service instance** is a service in one environment: it has its own variables, status, URL and deployments.
Most deploy calls therefore take an `environmentId`.

## A typical flow

```bash
API=https://skyhost.tech/api/v1
H="Authorization: Bearer $SKYHOST_TOKEN"

# 1. Find your team and project
curl -H "$H" $API/teams
curl -H "$H" $API/teams/$TEAM_ID/projects
curl -H "$H" $API/projects/$PROJECT_ID        # services, environments, URLs

# 2. Set a variable, then deploy the latest commit
curl -X PUT -H "$H" -H "Content-Type: application/json" \
  -d '{"serviceId":"'$SERVICE_ID'","variables":[{"key":"GREETING","value":"hello","secret":false}]}' \
  $API/environments/$ENV_ID/variables
curl -X POST -H "$H" -H "Content-Type: application/json" \
  -d '{"environmentId":"'$ENV_ID'"}' $API/services/$SERVICE_ID/deploy

# 3. Follow it
curl -H "$H" $API/deployments/$DEPLOYMENT_ID               # status: queued → building → deploying → live | failed
curl -H "$H" "$API/deployments/$DEPLOYMENT_ID/logs?after=0" # { lines: [...], nextCursor }
curl -H "$H" $API/deployments/$DEPLOYMENT_ID/diagnosis      # cause + fix when it failed

# Deploy a ZIP instead of a git commit
curl -X POST -H "$H" -F file=@app.zip "$API/services/$SERVICE_ID/deploy-zip?environmentId=$ENV_ID"

# Roll back
curl -X POST -H "$H" $API/deployments/$PREVIOUS_ID/rollback
```

Ready-made scripts: [`examples/api`](../../examples/api) (shell, Node.js, Python).

## Deployment statuses

`queued` → `building` → `deploying` → `live`. Final states: `live`, `failed`, `cancelled`, `superseded`
(replaced by a newer version), `stopped`. A failed deployment never replaces the live one.

## Errors

Every error has the same shape:

```json
{ "error": { "code": "not_found", "message": "Project not found", "details": null } }
```

| Status | `code` | Meaning |
| --- | --- | --- |
| 400 | `bad_request` | Invalid body or parameters (`details` lists the fields) |
| 401 | `unauthorized` | Missing, invalid or revoked key |
| 403 | `forbidden` | The key's scope or your role does not allow this (`ip_not_allowed`: blocked by an IP allow-list) |
| 404 | `not_found` | It does not exist, or you cannot see it |
| 409 | `conflict` | Name already used, deployment already running… |
| 402 | `quota_exceeded` | The plan does not include this feature, or a limit is reached |
| 429 | `rate_limited` | Slow down: see `Retry-After` |
| 503 | `unavailable` | Feature not enabled on SKYHOST, or maintenance |

## Rate limits

Requests are limited per API key and per IP; authentication endpoints are stricter. A `429` response carries
`Retry-After` (seconds).

## Capabilities

`GET /capabilities` (no auth) lists what is enabled right now — sign-in providers, git providers, payment
methods, email, maintenance. Clients should hide unavailable features instead of calling them.

## Realtime

- **Events**: WebSocket `wss://skyhost.tech/api/v1/ws`, then send
  `{"op":"subscribe","channel":"deployment:<id>"}`. Channels exist for deployments, services, projects, teams,
  users and databases.
- **Runtime logs**: `wss://skyhost.tech/api/v1/services/{id}/logs/stream?environmentId=…&tail=200`
- **Shell**: `wss://skyhost.tech/api/v1/services/{id}/shell?environmentId=…` — send `{"cmd":"ls -la"}`.

Pass the same `Authorization` header when opening the WebSocket.

## Webhooks and deploy hooks

- **Webhooks** push events to your server: [webhooks.md](../webhooks.md).
- **Deploy hooks** are secret URLs that deploy a service with one `POST`: [ci-cd.md](../ci-cd.md#2-deploy-hook--one-secret-url).
