# Deploy on SKYHOST button

Let anyone deploy your open-source project on SKYHOST in one click.

[![Deploy on SKYHOST](https://skyhost.tech/deploy-button.svg)](https://skyhost.tech/deploy?repo=https://github.com/INCONNU-BOY-SENSEI/skyhost)

## How it works

1. A visitor clicks the button in your README.
2. They create a free account (or sign in).
3. SKYHOST opens the new project page with your repository **already analyzed** — they click **Deploy**.

## Add it to your README

Replace `OWNER/REPO` with your repository.

**Markdown**

```markdown
[![Deploy on SKYHOST](https://skyhost.tech/deploy-button.svg)](https://skyhost.tech/deploy?repo=https://github.com/OWNER/REPO)
```

**HTML**

```html
<a href="https://skyhost.tech/deploy?repo=https://github.com/OWNER/REPO">
  <img src="https://skyhost.tech/deploy-button.svg" alt="Deploy on SKYHOST">
</a>
```

## Parameters

| Parameter | Example | |
| --- | --- | --- |
| `repo` | `https://github.com/OWNER/REPO` or `OWNER/REPO` | Public HTTPS Git repository (required) |
| `branch` | `main` | Branch to deploy (default branch otherwise) |

## Make the first deploy succeed

- Listen on `process.env.PORT` and `0.0.0.0`.
- Commit a `.env.example`: SmartDeploy lists its variables so people know what to fill in.
- **WhatsApp / Discord bots**: tell users to pick **Settings → Deployment strategy → Recreate** and to add a
  volume for the session folder (e.g. `/app/session`), so the bot keeps its login across deploys.
