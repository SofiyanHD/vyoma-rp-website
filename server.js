import express from "express";
import session from "express-session";
import Database from "better-sqlite3";
import { status } from "minecraft-server-util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new Database("vyoma.sqlite");
const PORT = Number(process.env.PORT || 3000);

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    discord TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || "development-only-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 *  60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, "public")));

const host = process.env.MINECRAFT_HOST || "vyomarp.raznar.net";
const port = Number(process.env.MINECRAFT_PORT || 25045);

app.get("/api/status", async (_req, res) => {
  try {
    const result = await status(host, port, { timeout: 5000 });
    res.json({
      online: true,
      host: `${host}:${port}`,
      playersOnline: result.players.online,
      playersMax: result.players.max,
      version: result.version.name,
      motd: result.motd.clean
    });
  } catch {
    res.json({ online: false, host: `${host}:${port}` });
  }
});

app.post("/api/apply", (req, res) => {
  const username = String(req.body.username || "").trim();
  const discord = String(req.body.discord || "").trim();
  const reason = String(req.body.reason || "").trim();
  if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) return res.status(400).json({ error: "Username Minecraft harus 3–16 karakter." });
  if (discord.length < 2 || discord.length > 80) return res.status(400).json({ error: "Isi username Discord yang valid." });
  if (reason.length < 10 || reason.length > 1000) return res.status(400).json({ error: "Alasan harus 10–1000 karakter." });
  const insert = db.prepare("INSERT INTO applications (username, discord, reason) VALUES (?, ?, ?)");
  insert.run(username, discord, reason);
  res.json({ ok: true, message: "Pendaftaran berhasil dikirim. Tunggu pemeriksaan staff." });
});

function adminOnly(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ error: "Silakan login sebagai staff." });
  next();
}
app.post("/api/admin/login", async (req, res) => {
  const username = String(req.body.username || "");
  const password = String(req.body.password || "");
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "";
  if (!expectedPass || username !== expectedUser || password !== expectedPass) {
    return res.status(401).json({ error: "Username atau password salah. Atur ADMIN_USERNAME dan ADMIN_PASSWORD di environment." });
  }
  req.session.admin = true;
  res.json({ ok: true });
});
app.post("/api/admin/logout", adminOnly, (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get("/api/admin/applications", adminOnly, (_req, res) => {
  res.json(db.prepare("SELECT * FROM applications ORDER BY id DESC").all());
});
app.patch("/api/admin/applications/:id", adminOnly, (req, res) => {
  const nextStatus = String(req.body.status || "");
  if (!["Pending", "Approved", "Rejected"].includes(nextStatus)) return res.status(400).json({ error: "Status tidak valid." });
  const result = db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(nextStatus, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Pendaftaran tidak ditemukan." });
  res.json({ ok: true });
});

app.get("/api/config", (_req, res) => res.json({ discord: process.env.DISCORD_INVITE || "" }));

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`VYOMA RP website running on port ${PORT}`));
