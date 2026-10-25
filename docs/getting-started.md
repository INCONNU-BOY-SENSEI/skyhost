# Getting started

This guide takes you from zero to a live URL. It takes about two minutes.

## 1. Create an account

Sign up at **[skyhost.tech](https://skyhost.tech/signup)** with your email, Google or GitHub. The free plan
needs no credit card.

## 2. Deploy — pick your way

### From the dashboard

1. Click **New project** in the sidebar.
2. Choose a source:
   - **GitHub** — connect your account once, pick a repository and a branch. Every push to that branch
     redeploys automatically.
   - **ZIP upload** — an archive of your project folder (without `node_modules`).
   - **Template** — a ready-made starter such as Next.js + PostgreSQL or a WhatsApp bot.
3. Check the **SmartDeploy** analysis: language, framework, build and start commands, port, variables. Change
   anything you want.
4. Click **Deploy**. The build logs stream live; when it finishes, the **Live at** banner shows your address.

### From the terminal

```bash
curl -fsSL https://raw.githubusercontent.com/INCONNU-BOY-SENSEI/skyhost/main/install.sh | sh
cd my-app
skyhost login   # approve this device in the browser
skyhost init    # create the project and deploy this folder
```

Your app is now live at `https://<name>.skyhost.tech` (the name comes from your repository or folder; if it
is taken, SKYHOST adds a number, e.g. `my-app-2`).

## 3. The one rule: listen on `PORT`

Web services receive a `PORT` environment variable. Your app must listen on that port **and on all interfaces
(`0.0.0.0`)**, not `localhost`:

```js
// Node.js
app.listen(process.env.PORT || 3000, "0.0.0.0");
```

```bash
# Python
uvicorn main:app --host 0.0.0.0 --port $PORT
```

If you forget this, the deployment fails its health check and the Smart Error Analyzer tells you exactly that.

## Next steps

- [Add a database](databases.md)
- [Set environment variables](configuration.md#environment-variables)
- [Connect your own domain](domains.md)
- [Deploy from GitHub Actions](ci-cd.md)
- [Automate everything with the API](api/README.md)
