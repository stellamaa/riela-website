import express from "express";
import fetch from "node-fetch"; // use global fetch if Node >=18
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const HOST_ID = process.env.MOMENCE_HOST_ID;
const TOKEN = process.env.MOMENCE_API_TOKEN;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:4000";

if (!HOST_ID || !TOKEN) {
  console.error("❌ Missing MOMENCE_HOST_ID or MOMENCE_API_TOKEN in .env");
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
  })
);

// Cache in memory
let cache = { ts: 0, data: null };
const CACHE_TTL_SECONDS = 30;

async function fetchMomenceEvents() {
  const endpoint = `https://api.momence.com/api/v1/Events?hostId=${HOST_ID}&token=${TOKEN}`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Momence fetch failed: ${res.status}`);
  }
  return res.json();
}

// GET /api/events
app.get("/api/events", async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    if (cache.data && now - cache.ts < CACHE_TTL_SECONDS) {
      return res.json(cache.data);
    }
    const data = await fetchMomenceEvents();
    cache = { ts: now, data };
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Unable to fetch events from Momence" });
  }
});

// Static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server listening at http://localhost:${PORT}`)
);
