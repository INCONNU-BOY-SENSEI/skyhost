# Databases

Managed **PostgreSQL**, **MySQL (MariaDB)**, **MongoDB** and **Redis**.

## Create

- Dashboard: **New database** → engine, name, size. Ready in a few seconds.
- CLI: `skyhost db create postgres mydb`
- API: `POST /api/v1/databases` with `{ "projectId": "…", "name": "mydb", "engine": "postgres" }`

The database page shows:

- **Internal URL** — use it from your SKYHOST services; traffic stays on the private network.
- **External URL** — from your computer (a database client, migrations). Enable it first and restrict it to
  your IP when possible.
- host, port, database name, user and password (`GET /api/v1/databases/{id}/credentials`).

## Connect to a service

On the database page, open **Connections** and pick a service. SKYHOST adds the variable and redeploys:

| Engine | Variable |
| --- | --- |
| PostgreSQL, MySQL | `DATABASE_URL` |
| MongoDB | `MONGODB_URI` |
| Redis | `REDIS_URL` |

Or reference it yourself: `DATABASE_URL=${{mydb.DATABASE_URL}}`. References follow password rotations.

## Backups

Paid plans get automatic daily backups. Take a manual backup or restore one from the **Backups** tab, or via
`POST /api/v1/databases/{id}/backups` and `POST /api/v1/backups/{id}/restore`.

> Deleting a database deletes its data **and its backups** for good. Download a backup first if you may need it.
