# CI/CD

Three ways to deploy from a pipeline, from the simplest to the most flexible.

## 1. GitHub integration (no pipeline at all)

Connect GitHub when you create the service: every push to the branch deploys automatically, and pull requests
can get preview environments.

## 2. Deploy hook — one secret URL

Service → Settings → **Deploy hooks** → *Create* (or `POST /api/v1/services/{id}/deploy-hooks` with
`{ "name": "CI", "environmentId": "…" }`). The URL is shown **once**; store it as a secret.

```bash
curl -X POST "$SKYHOST_DEPLOY_HOOK"
# {"deployment":{"id":"…","status":"queued"}}
```

Works from any CI, a CMS "publish" button, or a cron job. Revoke it any time.

## 3. CLI or API with an API key

Create a key in **Account → API keys** with the `deploy` scope (it can read and deploy, nothing else).

### GitHub Actions — deploy the repository with the CLI

```yaml
# .github/workflows/skyhost.yml
name: Deploy to SKYHOST
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install -g github:INCONNU-BOY-SENSEI/skyhost
      - run: |
          skyhost login --token "$SKYHOST_TOKEN"
          skyhost link --project "my-app" --service "my-app" --environment production
          skyhost deploy
        env:
          SKYHOST_TOKEN: ${{ secrets.SKYHOST_TOKEN }}
```

`skyhost deploy` exits with code `1` when the deployment fails, so the job goes red — and the previous version
stays live.

### GitHub Actions — trigger a deploy hook

```yaml
      - run: curl -fsS -X POST "${{ secrets.SKYHOST_DEPLOY_HOOK }}"
```

More: [`examples/github-actions`](../examples/github-actions).

## API key scopes

| Scope | Allows |
| --- | --- |
| `read` | Read projects, services, deployments, logs, metrics |
| `deploy` | `read` + create, cancel and roll back deployments |
| `write` | Everything except deleting/transferring teams, billing, member roles and API keys |
| `admin` | Everything the key's creator can do |

A key can never do more than the user who created it. Rotate or revoke keys in **Account → API keys**.
