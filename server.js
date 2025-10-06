import express from "express";
import fetch from "node-fetch"; // global in Node >=18
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const HOST_ID = process.env.MOMENCE_HOST_ID; // e.g. 89357
const CLIENT_ID = process.env.MOMENCE_CLIENT_ID;
const CLIENT_SECRET = process.env.MOMENCE_CLIENT_SECRET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:4000";

if (!HOST_ID || !CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Missing MOMENCE_HOST_ID, CLIENT_ID, or CLIENT_SECRET in .env");
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN }));

// === Rate limiting ===
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
  })
);

// ===== TOKEN CACHE =====
let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const res = await fetch("https://api.momence.com/api/v2/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) throw new Error(`❌ Failed to fetch token: ${res.status}`);

  const data = await res.json();
  tokenCache.token = data.access_token;
  tokenCache.expiresAt = now + (data.expires_in * 1000 - 5000); // buffer
  console.log("✅ New token fetched");
  return tokenCache.token;
}

// ===== CACHE APPOINTMENTS =====
let cache = { ts: 0, data: null };
const CACHE_TTL_SECONDS = 30;

async function fetchMomenceAppointments() {
  const token = await getAccessToken();

  const res = await fetch(
    `https://api.momence.com/api/v2/hosts/${HOST_ID}/event-instances?upcomingOnly=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(`Momence fetch failed: ${res.status}`);

  const data = await res.json();

  // Normalize structure for frontend
  return data.data.map((inst) => ({
    id: inst.id,
    title: inst.event?.title || "Session",
    duration: inst.event?.duration,
    price: inst.event?.price?.amount,
    currency: inst.event?.price?.currency,
    start: inst.start_date,
    booking_url: inst.booking_url,
  }));
}

// GET /api/events
app.get("/api/events", async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    if (cache.data && now - cache.ts < CACHE_TTL_SECONDS) {
      return res.json(cache.data);
    }
    const data = await fetchMomenceAppointments();
    cache = { ts: now, data };
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Unable to fetch appointments from Momence" });
  }
});

// ===== STATIC FRONTEND =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server listening at http://localhost:${PORT}`)
);
