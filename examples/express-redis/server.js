import express from "express";
import { createClient } from "redis";

const app = express();
const redis = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : null;
redis?.on("error", (e) => console.error("redis:", e.message));
if (redis) await redis.connect();

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/", async (_req, res) => {
  if (!redis) return res.status(500).json({ error: "REDIS_URL is not set: connect a Redis database to this service." });
  const hits = await redis.incr("hits");
  res.json({ message: "Hello from Express on SKYHOST", hits });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, "0.0.0.0", () => console.log(`Listening on :${port}`));
