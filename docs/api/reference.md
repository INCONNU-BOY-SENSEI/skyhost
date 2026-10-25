# API reference

> Generated from the SKYHOST OpenAPI document — import [`openapi/skyhost.openapi.json`](../../openapi/skyhost.openapi.json) into Postman, Insomnia or any OpenAPI tool.
> Live, interactive explorer: **https://skyhost.tech/api/docs**

Base URL: `https://skyhost.tech/api/v1` · Auth: `Authorization: Bearer sky_...`

## Contents

- [Projects](#projects) — 9 endpoint(s)
- [Environments](#environments) — 2 endpoint(s)
- [Services](#services) — 9 endpoint(s)
- [Deployments](#deployments) — 12 endpoint(s)
- [Logs](#logs) — 4 endpoint(s)
- [Variables](#variables) — 14 endpoint(s)
- [Domains](#domains) — 5 endpoint(s)
- [Databases](#databases) — 14 endpoint(s)
- [Database backups](#database-backups) — 4 endpoint(s)
- [Volumes](#volumes) — 4 endpoint(s)
- [Jobs & cron](#jobs--cron) — 4 endpoint(s)
- [Deploy hooks](#deploy-hooks) — 4 endpoint(s)
- [SmartDeploy](#smartdeploy) — 2 endpoint(s)
- [Git providers](#git-providers) — 8 endpoint(s)
- [Code editor](#code-editor) — 3 endpoint(s)
- [Object storage (buckets)](#object-storage-buckets) — 7 endpoint(s)
- [Screenshots](#screenshots) — 10 endpoint(s)
- [Uptime & status pages](#uptime--status-pages) — 4 endpoint(s)
- [Outgoing webhooks](#outgoing-webhooks) — 6 endpoint(s)
- [Notifications](#notifications) — 8 endpoint(s)
- [Alerts](#alerts) — 3 endpoint(s)
- [Teams](#teams) — 5 endpoint(s)
- [Members & invites](#members--invites) — 10 endpoint(s)
- [API keys](#api-keys) — 4 endpoint(s)
- [CLI device login](#cli-device-login) — 2 endpoint(s)
- [Authentication](#authentication) — 2 endpoint(s)
- [Public](#public) — 4 endpoint(s)
- [Search](#search) — 1 endpoint(s)

## Projects

### `POST /projects`

Create a project (with its production environment).

| Body field | Type | Required |
| --- | --- | --- |
| `teamId` | string (uuid) | yes |
| `name` | string | yes |
| `description` | string | no |
| `region` | string | no |

### `DELETE /projects/{id}`

Delete a project (send `confirmName`).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `confirmName` | string | yes |

### `GET /projects/{id}`

Get a project with its services, environments and live URLs.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PATCH /projects/{id}`

Rename / describe a project.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | no |
| `description` | string | no |

### `PUT /projects/{id}/canvas`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `positions` | object | yes |

### `GET /projects/{id}/changelog`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /projects/{id}/export`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /projects/{id}/transfer`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `targetTeamId` | string (uuid) | yes |

### `GET /teams/{teamId}/projects`

List the projects of a team.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |


## Environments

### `DELETE /environments/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /projects/{id}/environments`

Create an environment (staging, preview…).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `type` | `production` \| `staging` \| `preview` \| `development` | yes |
| `cloneFrom` | string (uuid) | no |
| `cloneDatabases` | boolean | no |
| `anonymize` | boolean | no |


## Services

### `POST /projects/{id}/services`

Create a service (git repo, ZIP upload, Docker image or template).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `type` | `web` \| `static` \| `worker` \| `cron` \| `private` \| `docker` \| `job` | yes |
| `source` | object or object or object or object | yes |
| `config` | object | no |
| `deploy` | boolean | no |

### `DELETE /services/{id}`

Delete a service.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `confirmName` | string | yes |

### `GET /services/{id}`

Get a service.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PATCH /services/{id}`

Update a service configuration (build, start, port, resources…).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | no |
| `config` | object | no |

### `POST /services/{id}/duplicate`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |

### `POST /services/{id}/restart`

Restart the running containers.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |

### `PUT /services/{id}/source`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `source` | object or object or object or object | yes |

### `POST /services/{id}/start`

Start a stopped service.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |

### `POST /services/{id}/stop`

Stop a service.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |


## Deployments

### `GET /deployments/{id}`

Get a deployment and its status.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /deployments/{id}/autofix`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `index` | integer | yes |
| `mode` | `apply` \| `pull_request` | yes |
| `value` | string | no |
| `confirm` | `True` | yes |

### `POST /deployments/{id}/cancel`

Cancel a queued or building deployment.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /deployments/{id}/comments`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /deployments/{id}/comments`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `body` | string | yes |

### `GET /deployments/{id}/diagnosis`

Why a deployment failed, with a suggested fix.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /deployments/{id}/rollback`

Roll back to this deployment.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /services/{id}/canary`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |
| `action` | `set_weight` \| `promote` \| `abort` | yes |
| `weight` | integer | no |

### `POST /services/{id}/deploy`

Deploy the latest commit (or a given `commitSha` / `branch`).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | no |
| `commitSha` | string | no |
| `branch` | string | no |

### `POST /services/{id}/deploy-zip`

Deploy a ZIP archive (multipart field `file`).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string | yes |

Body: `multipart/form-data` with a `file` field (ZIP, max 100 MB).

### `GET /services/{id}/deployments`

List deployments of a service.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `environmentId` | query | string (uuid) | no |
| `limit` | query | integer | no |
| `before` | query | string (date-time) | no |
| `id` | path | string (uuid) | yes |

### `POST /services/{id}/redeploy`

Redeploy the live version (e.g. after changing variables).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |


## Logs

### `GET /databases/{id}/logs`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `lines` | query | integer | no |
| `id` | path | string (uuid) | yes |

### `GET /deployments/{id}/logs`

Build & deploy logs (`after` cursor for polling).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `after` | query | integer | no |
| `limit` | query | integer | no |
| `stream` | query | `build` \| `deploy` | no |
| `id` | path | string (uuid) | yes |

### `GET /deployments/{id}/logs/download`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /services/{id}/logs`

Runtime logs.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `environmentId` | query | string (uuid) | yes |
| `tail` | query | integer | no |
| `sinceMinutes` | query | integer | no |
| `search` | query | string | no |
| `level` | query | `error` \| `warn` \| `info` \| `debug` | no |
| `download` | query | `true` \| `false` \| `1` \| `0` | no |
| `id` | path | string (uuid) | yes |


## Variables

### `GET /environments/{id}/variables`

List variables (`serviceId`, `reveal=true` for secrets).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `serviceId` | query | string (uuid) | no |
| `reveal` | query | `true` \| `false` \| `1` \| `0` | no |
| `id` | path | string (uuid) | yes |

### `PUT /environments/{id}/variables`

Create or update variables.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `serviceId` | string (uuid) | no |
| `variables` | object[] | yes |
| `replace` | boolean | no |

### `POST /environments/{id}/variables/copy`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `toEnvironmentId` | string (uuid) | yes |
| `includeSecrets` | boolean | no |

### `GET /environments/{id}/variables/export`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `serviceId` | query | string (uuid) | no |
| `format` | query | `env` \| `json` | no |
| `id` | path | string (uuid) | yes |

### `POST /environments/{id}/variables/import`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `serviceId` | string (uuid) | no |
| `format` | `env` \| `json` | yes |
| `content` | string | yes |
| `secret` | boolean | no |

### `GET /services/{id}/variables/resolved`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `environmentId` | query | string (uuid) | yes |
| `id` | path | string (uuid) | yes |

### `GET /services/{id}/variables/suggested`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `environmentId` | query | string (uuid) | yes |
| `id` | path | string (uuid) | yes |

### `GET /teams/{teamId}/variable-groups`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

### `POST /teams/{teamId}/variable-groups`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `description` | string | no |
| `parentId` | string (uuid) | no |

### `DELETE /variable-groups/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PUT /variable-groups/{id}/items`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `items` | object[] | yes |

### `POST /variable-groups/{id}/links`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `projectId` | string (uuid) | no |
| `serviceId` | string (uuid) | no |
| `environmentType` | `production` \| `staging` \| `preview` \| `development` | no |

### `DELETE /variable-groups/{id}/links/{linkId}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |
| `linkId` | path | string (uuid) | yes |

### `DELETE /variables/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |


## Domains

### `DELETE /domains/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PATCH /domains/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `isPrimary` | boolean | no |
| `redirectTo` | string | no |

### `POST /domains/{id}/verify`

Check the DNS records of a domain.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /services/{id}/domains`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /services/{id}/domains`

Add a custom domain.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `hostname` | string | yes |
| `redirectTo` | string | no |
| `environmentId` | string (uuid) | no |


## Databases

### `GET /database-engines`

### `POST /databases`

Create a managed database (postgres, mariadb, mongodb, redis).

| Body field | Type | Required |
| --- | --- | --- |
| `projectId` | string (uuid) | yes |
| `name` | string | yes |
| `engine` | `postgres` \| `mariadb` \| `mongodb` \| `redis` | yes |
| `version` | string | no |
| `region` | string | no |
| `storageMb` | integer | no |
| `environmentId` | string (uuid) | no |
| `connectServiceIds` | string (uuid)[] | no |

### `DELETE /databases/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `confirmName` | string | yes |
| `keepBackups` | boolean | no |

### `GET /databases/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PATCH /databases/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `deletionProtection` | boolean | no |
| `backupsEnabled` | boolean | no |
| `backupSchedule` | string | no |
| `backupRetentionDays` | integer | no |
| `publicAccess` | boolean | no |
| `ipAllowlist` | string[] | no |

### `GET /databases/{id}/connectable-services`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /databases/{id}/connections`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `serviceId` | string (uuid) | yes |
| `variableName` | string | no |

### `DELETE /databases/{id}/connections/{serviceId}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |
| `serviceId` | path | string (uuid) | yes |

### `GET /databases/{id}/credentials`

Connection details of a database.

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /databases/{id}/query`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `sql` | string | no |
| `collection` | string | no |
| `filter` | string | no |
| `command` | string | no |
| `limit` | integer | no |

### `POST /databases/{id}/rotate-credentials`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /databases/{id}/tables`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /projects/{id}/databases`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /teams/{teamId}/databases`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `engine` | `postgres` \| `mariadb` \| `mongodb` \| `redis` | yes |
| `version` | string | no |
| `region` | string | no |
| `storageMb` | integer | no |


## Database backups

### `GET /backups/{id}/download`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /backups/{id}/restore`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `confirmName` | string | yes |

### `GET /databases/{id}/backups`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /databases/{id}/backups`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |


## Volumes

### `POST /services/{id}/volumes`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `mountPath` | string | yes |
| `sizeMb` | integer | yes |

### `DELETE /volumes/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `confirmName` | string | yes |

### `GET /volumes/{id}/snapshots`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /volumes/{id}/snapshots`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |


## Jobs & cron

### `GET /jobs/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /services/{id}/cron/run`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |

### `GET /services/{id}/jobs`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `limit` | query | integer | no |
| `id` | path | string (uuid) | yes |

### `POST /services/{id}/jobs`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |
| `command` | string | yes |


## Deploy hooks

### `DELETE /deploy-hooks/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /hooks/deploy/{token}`

Trigger a deploy hook (no auth: the secret is in the URL).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `token` | path | string | yes |

### `GET /services/{id}/deploy-hooks`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /services/{id}/deploy-hooks`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `environmentId` | string (uuid) | yes |


## SmartDeploy

### `POST /projects/analyze`

Analyze a repository with SmartDeploy (runtime, commands, port, variables).

| Body field | Type | Required |
| --- | --- | --- |
| `teamId` | string (uuid) | yes |
| `source` | object or object or object or object | yes |
| `rootDir` | string | no |

### `POST /projects/launch`

Create a project from a SmartDeploy analysis and deploy it.

| Body field | Type | Required |
| --- | --- | --- |
| `teamId` | string (uuid) | yes |
| `projectId` | string (uuid) | no |
| `projectName` | string | no |
| `source` | object or object or object or object | yes |
| `services` | object[] | yes |
| `databases` | object[] | no |
| `deploy` | boolean | no |


## Git providers

### `GET /git/github/install`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | query | string (uuid) | yes |

### `DELETE /git/installations/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /git/installations/{id}/branches`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `repo` | query | string | yes |
| `id` | path | string (uuid) | yes |

### `GET /git/installations/{id}/repos`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `q` | query | string | no |
| `id` | path | string (uuid) | yes |

### `GET /git/providers`

### `POST /git/public/branches`

| Body field | Type | Required |
| --- | --- | --- |
| `url` | string (uri) | yes |

### `GET /git/{provider}/connect`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | query | string (uuid) | yes |
| `provider` | path | `gitlab` \| `bitbucket` | yes |

### `GET /teams/{teamId}/git/installations`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |


## Code editor

### `POST /services/{id}/code/commit`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `message` | string | yes |
| `changes` | object[] | yes |

### `GET /services/{id}/code/file`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `path` | query | string | yes |
| `ref` | query | string | no |
| `id` | path | string (uuid) | yes |

### `GET /services/{id}/code/tree`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `ref` | query | string | no |
| `id` | path | string (uuid) | yes |


## Object storage (buckets)

### `POST /buckets`

| Body field | Type | Required |
| --- | --- | --- |
| `projectId` | string (uuid) | yes |
| `name` | string | yes |
| `isPublic` | boolean | no |
| `quotaMb` | integer | no |

### `DELETE /buckets/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `confirmName` | string | yes |

### `PATCH /buckets/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `isPublic` | boolean | no |
| `quotaMb` | integer | no |

### `GET /buckets/{id}/credentials`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /buckets/{id}/presign`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `key` | string | yes |
| `method` | `GET` \| `PUT` | no |
| `expiresSeconds` | integer | no |

### `GET /buckets/{id}/usage`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /projects/{id}/buckets`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |


## Screenshots

### `GET /public/screenshots/{token}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `token` | path | string | yes |

### `GET /public/screenshots/{token}/meta`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `token` | path | string | yes |

### `DELETE /screenshots/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PATCH /screenshots/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `title` | string | no |
| `description` | string | no |

### `GET /screenshots/{id}/image`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `DELETE /screenshots/{id}/share`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /screenshots/{id}/share`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `expiresInDays` | integer | no |

### `GET /services/{id}/screenshots`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `limit` | query | integer | no |
| `id` | path | string (uuid) | yes |

### `POST /services/{id}/screenshots`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `environmentId` | string (uuid) | yes |
| `path` | string | no |
| `viewport` | `desktop` \| `tablet` \| `mobile` | no |
| `fullPage` | boolean | no |
| `delayMs` | integer | no |
| `title` | string | no |
| `description` | string | no |

### `POST /services/{id}/screenshots/upload`

Upload an image or short video (multipart 'file', fields title/description/deploymentId).

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string | yes |


## Uptime & status pages

### `POST /projects/{id}/incidents`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `title` | string | yes |
| `status` | `investigating` \| `identified` \| `monitoring` \| `resolved` | no |
| `impact` | `minor` \| `major` \| `critical` | no |
| `body` | string | no |

### `GET /projects/{id}/uptime`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /projects/{id}/uptime`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `url` | string (uri) | yes |
| `intervalSeconds` | integer | no |
| `expectedStatus` | integer | no |
| `serviceId` | string (uuid) | no |

### `DELETE /uptime/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |


## Outgoing webhooks

### `GET /teams/{teamId}/webhooks`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

### `POST /teams/{teamId}/webhooks`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `url` | string (uri) | yes |
| `events` | `deployment.succeeded` \| `deployment.failed` \| `deployment.started` \| `deployment.rolled_back` \| `database.ready` \| `database.backup.completed` \| `database.backup.failed` \| `service.crashed` …[] | no |

### `DELETE /webhooks/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PATCH /webhooks/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `enabled` | boolean | no |
| `events` | `deployment.succeeded` \| `deployment.failed` \| `deployment.started` \| `deployment.rolled_back` \| `database.ready` \| `database.backup.completed` \| `database.backup.failed` \| `service.crashed` …[] | no |

### `GET /webhooks/{id}/deliveries`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /webhooks/{id}/rotate-secret`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |


## Notifications

### `DELETE /notification-channels/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `PATCH /notification-channels/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `enabled` | boolean | no |
| `events` | `deployment.succeeded` \| `deployment.failed` \| `deployment.started` \| `deployment.rolled_back` \| `database.ready` \| `database.backup.completed` \| `database.backup.failed` \| `service.crashed` …[] | no |
| `quietHours` | object | no |
| `name` | string | no |

### `POST /notification-channels/{id}/test`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /notifications`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `unread` | query | `true` \| `false` \| `1` \| `0` | no |
| `limit` | query | integer | no |

### `POST /notifications/read-all`

### `POST /notifications/{id}/read`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /teams/{teamId}/notification-channels`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

### `POST /teams/{teamId}/notification-channels`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |


## Alerts

### `DELETE /alerts/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `GET /teams/{teamId}/alerts`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

### `POST /teams/{teamId}/alerts`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `serviceId` | string (uuid) | no |
| `metric` | `cpu` \| `memory` \| `crash` \| `unhealthy` \| `deploy_failed` \| `quota` | yes |
| `threshold` | number | no |
| `durationMinutes` | integer | no |


## Teams

### `GET /teams`

Teams you belong to.

### `GET /teams/{teamId}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

### `PUT /teams/{teamId}/deploy-freeze`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `enabled` | boolean | yes |
| `mode` | `deny` \| `allow` | no |
| `timezone` | string | no |
| `windows` | object[] | yes |

### `GET /teams/{teamId}/onboarding`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

### `GET /teams/{teamId}/usage`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |


## Members & invites

### `GET /invites/{token}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `token` | path | string | yes |

### `POST /invites/{token}/{action}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `token` | path | string | yes |
| `action` | path | `accept` \| `decline` | yes |

### `PUT /projects/{id}/members/{userId}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |
| `userId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `role` | `owner` \| `admin` \| `developer` \| `member` \| `viewer` | yes |

### `POST /teams/{teamId}/invites`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `email` | string (email) | yes |
| `role` | `owner` \| `admin` \| `developer` \| `member` \| `viewer` | yes |

### `DELETE /teams/{teamId}/invites/{id}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |
| `id` | path | string (uuid) | yes |

### `GET /teams/{teamId}/members`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

### `DELETE /teams/{teamId}/members/{userId}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |
| `userId` | path | string (uuid) | yes |

### `PATCH /teams/{teamId}/members/{userId}`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |
| `userId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `role` | `owner` \| `admin` \| `developer` \| `member` \| `viewer` | yes |

### `GET /teams/{teamId}/members/{userId}/projects`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |
| `userId` | path | string (uuid) | yes |

### `POST /teams/{teamId}/transfer`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | path | string (uuid) | yes |

| Body field | Type | Required |
| --- | --- | --- |
| `userId` | string (uuid) | yes |


## API keys

### `GET /api-keys`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `teamId` | query | string (uuid) | no |

### `POST /api-keys`

Create an API key (the secret is shown once).

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `teamId` | string (uuid) | yes |
| `scopes` | `read` \| `deploy` \| `write` \| `admin`[] | yes |
| `projectId` | string (uuid) | no |
| `serviceId` | string (uuid) | no |
| `expiresInDays` | integer | no |

### `POST /api-keys/{id}/revoke`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |

### `POST /api-keys/{id}/rotate`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `id` | path | string (uuid) | yes |


## CLI device login

### `POST /auth/cli/poll`

Poll a CLI device login.

| Body field | Type | Required |
| --- | --- | --- |
| `deviceCode` | string | yes |

### `POST /auth/cli/start`

Start a CLI device login.


## Authentication

### `GET /auth/me`

The current user (and API key scopes).

### `GET /auth/providers`


## Public

### `GET /capabilities`

What this SKYHOST installation supports (public).

### `POST /public/abuse-reports`

| Body field | Type | Required |
| --- | --- | --- |
| `targetUrl` | string (uri) | yes |
| `category` | `phishing` \| `spam` \| `malware` \| `mining` \| `ddos` \| `copyright` \| `other` | yes |
| `description` | string | yes |
| `email` | string (email) | no |

### `GET /public/announcements`

### `GET /public/status`


## Search

### `GET /search`

| Parameter | In | Type | Required |
| --- | --- | --- | --- |
| `q` | query | string | yes |
| `teamId` | query | string (uuid) | no |

