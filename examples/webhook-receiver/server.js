import crypto from "node:crypto";
import express from "express";

const app = express();

function verify(header, rawBody, secret) {
  const { t, v1 } = Object.fromEntries((header ?? "").split(",").map((p) => p.split("=")));
  if (!t || !v1 || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return v1.length === expected.length && crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}

app.post("/skyhost-webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!verify(req.get("X-Skyhost-Signature"), req.body, process.env.SKYHOST_WEBHOOK_SECRET)) return res.sendStatus(401);
  const event = JSON.parse(req.body);
  console.log(`[${event.event}] ${event.data.title}`);
  res.sendStatus(204);
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
