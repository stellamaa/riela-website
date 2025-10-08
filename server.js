// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const CLIENT_ID = process.env.MOMENCE_CLIENT_ID;
const CLIENT_SECRET = process.env.MOMENCE_CLIENT_SECRET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:4000";
const PORT = process.env.PORT || 4000;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Missing CLIENT_ID or CLIENT_SECRET in .env");
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));

// ===== Access Token Cache =====
let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt) return tokenCache.token;

  const res = await fetch("https://api.momence.com/api/v2/auth/token", {
    method: "POST",
headers: {
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: "stellamathioudakisart@gmail.com",
      password: "Knwssos1",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Failed to fetch access token: ${res.status}`);

  tokenCache.token = data.access_token;
  tokenCache.expiresAt = now + (data.expires_in * 1000 - 5000);
  console.log("✅ Got new access token");
  return tokenCache.token;
}

// ===== Fetch Appointments =====
async function fetchMomenceAppointments() {
  const token = await getAccessToken();
  const hostId = process.env.MOMENCE_HOST_ID;
  const url = `https://api.momence.com/plugin/appointment-boards/63782/services`;

  console.log("📡 Fetching Momence services from:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  console.log("🔍 Momence response:", text);  // 👈 add this
  if (!res.ok) throw new Error(`Momence fetch failed: ${res.status} - ${text}`);

  const data = JSON.parse(text);
  console.log("✅ Fetched", data?.length || 0, "appointments");
  return data.map((service) => ({
    id: service.id,
    title: service.appointmentService?.name || "Session",
    duration: service.appointmentService?.minDurationInMinutes || null,
    price: service.appointmentService?.priceInCurrency || null,
    currency: "EUR",
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow as placeholder
    booking_url: `https://momence.com/${hostId}/booking/${service.appointmentServiceId}`,
  }));
}


// ===== API route =====
app.get("/api/events", async (req, res) => {
  try {
    const data = await fetchMomenceAppointments();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Unable to fetch appointments from Momence" });
  }
});

// ===== Serve static frontend =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
