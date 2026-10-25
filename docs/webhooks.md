# Webhooks

SKYHOST can `POST` a signed JSON message to your server when something happens in your team.

## Create a webhook

Team settings → **Webhooks**, or:

```bash
curl -X POST https://skyhost.tech/api/v1/teams/$TEAM_ID/webhooks \
  -H "Authorization: Bearer $SKYHOST_TOKEN" -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/skyhost-webhook","events":["deployment.failed","service.crashed"]}'
```

The response contains the signing **secret** (`whsk_…`) — it is shown once. An empty `events` list subscribes
to every event. The URL must be public HTTPS.

## Events

| Event | When |
| --- | --- |
| `deployment.started` · `deployment.succeeded` · `deployment.failed` · `deployment.rolled_back` | Deployment lifecycle |
| `service.crashed` · `service.unhealthy` | A running service stops or fails its health checks |
| `database.ready` · `database.backup.completed` · `database.backup.failed` | Databases |
| `domain.verified` | A custom domain passed verification |
| `alert.triggered` | One of your alert rules fired |
| `quota.near_limit` · `spend.threshold` | Plan limits and spending |
| `screenshot.captured` | A release screenshot is ready |

## Request

```http
POST /skyhost-webhook HTTP/1.1
Content-Type: application/json
User-Agent: SKYHOST-Webhook/1.0
X-Skyhost-Event: deployment.failed
X-Skyhost-Delivery: 7f9c…
X-Skyhost-Signature: t=1761400000,v1=5d41402abc4b2a76b9719d911017c592…

{
  "id": "q3h8x0…",
  "event": "deployment.failed",
  "createdAt": "2026-10-25T09:43:38.000Z",
  "data": { "title": "…", "body": "…", "link": "https://skyhost.tech/…" }
}
```

Answer with any `2xx` within 10 seconds. Failed deliveries are retried with exponential backoff (6 attempts);
every delivery and its response is listed in the dashboard.

## Verify the signature

`v1` is the hex HMAC-SHA256 of `"<t>.<raw body>"` with your secret. Reject requests whose signature does not
match or whose timestamp `t` is more than 5 minutes old.

```js
// Node.js (Express) — use the raw body, not the parsed JSON
import crypto from "node:crypto";
import express from "express";

const app = express();
app.post("/skyhost-webhook", express.raw({ type: "application/json" }), (req, res) => {
  const header = req.get("X-Skyhost-Signature") ?? "";
  const { t, v1 } = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const expected = crypto.createHmac("sha256", process.env.SKYHOST_WEBHOOK_SECRET).update(`${t}.${req.body}`).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(t)) < 300;
  if (!fresh || !v1 || !crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))) return res.sendStatus(401);
  const event = JSON.parse(req.body);
  console.log(event.event, event.data.title);
  res.sendStatus(204);
});
app.listen(process.env.PORT || 3000, "0.0.0.0");
```

```python
# Python (Flask)
import hashlib, hmac, os, time
from flask import Flask, request, abort

app = Flask(__name__)

@app.post("/skyhost-webhook")
def skyhost_webhook():
    parts = dict(p.split("=", 1) for p in request.headers.get("X-Skyhost-Signature", "").split(",") if "=" in p)
    raw = request.get_data()
    expected = hmac.new(os.environ["SKYHOST_WEBHOOK_SECRET"].encode(), f"{parts.get('t')}.".encode() + raw, hashlib.sha256).hexdigest()
    if not parts.get("t") or abs(time.time() - int(parts["t"])) > 300 or not hmac.compare_digest(parts.get("v1", ""), expected):
        abort(401)
    event = request.get_json()
    print(event["event"], event["data"]["title"])
    return "", 204
```

## Other notification channels

Email, Telegram, WhatsApp, Slack and Discord alerts are configured in **Team settings → Notifications** — no
code needed.
