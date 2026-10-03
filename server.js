const express = require("express");
const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const http = require("http");
const path = require("path");

const app = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/api/ws" });

const SYMBOLS = [
  { emoji: "🍒", payout: 50 },
  { emoji: "🍋", payout: 75 },
  { emoji: "🍇", payout: 120 },
  { emoji: "🍉", payout: 200 },
  { emoji: "⭐", payout: 500 },
  { emoji: "💎", payout: 2500 },
  { emoji: "🔔", payout: 10000 },
];
const SPIN_COST = 25;
const FLAG_COST = 1000000;
const STREAK_MULTIPLIER = 1.5;
const FLAG = "brunner{s33d_r0t4t3d_t00_s00n}"; // swap for your own flag

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function hmacHex(serverSeed, clientSeed, nonce) {
  return crypto.createHmac("sha256", serverSeed).update(`${clientSeed}:${nonce}`).digest("hex");
}
/*
// Standard provably-fair RNG: split the 32-byte HMAC output into 4-byte
// chunks, normalize each to [0,1), map onto the symbol list.
function deriveResult(serverSeed, clientSeed, nonce) {
  const hex = hmacHex(serverSeed, clientSeed, nonce);
  const chunks = hex.match(/.{1,8}/g); // 8 chunks of 4 bytes each
  const result = [];
  for (let i = 0; i < 3; i++) {
    const value = parseInt(chunks[i], 16) / 0x100000000;
    const idx = Math.floor(value * SYMBOLS.length);
    result.push(SYMBOLS[idx].emoji);
  }
  return { result, hmac: hex };
}
*/

// Provably-fair RNG: take the HMAC output's first 3 bytes, one per reel,
// and map each byte onto the symbol list with a simple modulo.
function deriveResult(serverSeed, clientSeed, nonce) {
  const hex = hmacHex(serverSeed, clientSeed, nonce);
  const result = [];
  for (let i = 0; i < 3; i++) {
    const byte = parseInt(hex.substr(i * 2, 2), 16);
    const idx = byte % SYMBOLS.length;
    result.push(SYMBOLS[idx].emoji);
  }
  return { result, hmac: hex };
}

function newSeed() {
  return crypto.randomBytes(32).toString("hex");
}

// Persistent per-visitor state, keyed by a cookie. Progress survives page
// reloads and new WebSocket connections; only clearing cookies resets it.
const players = new Map();

function newPlayer() {
  return {
    cash: 1000,
    streak: 0,
    clientSeed: crypto.randomBytes(8).toString("hex"),
    serverSeed: newSeed(),
    serverSeedHash: "",
    nonce: 0,
  };
}

function getPlayer(userId) {
  let player = players.get(userId);
  if (!player) {
    player = newPlayer();
    player.serverSeedHash = sha256(player.serverSeed);
    players.set(userId, player);
  }
  return player;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

// Ensure every HTTP request (page load, static assets) has a userid cookie
// before the WebSocket upgrade happens, so the WS handshake carries it.
app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.userid) {
    const id = crypto.randomUUID();
    res.setHeader(
      "Set-Cookie",
      `userid=${id}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
    );
    req.userId = id;
  } else {
    req.userId = cookies.userid;
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", (ws, req) => {
  const cookies = parseCookies(req.headers.cookie);
  const userId = cookies.userid || crypto.randomUUID();
  const player = getPlayer(userId);

  function send(obj) {
    ws.send(JSON.stringify(obj));
  }

  function nextCommitment() {
    const { hmac } = deriveResult(player.serverSeed, player.clientSeed, player.nonce);
    return { hash: sha256(hmac) };
  }

  function sendState(extra = {}) {
    send({
      type: "state",
      symbols: SYMBOLS,
      streakMultiplier: STREAK_MULTIPLIER,
      cash: player.cash,
      streak: player.streak,
      spinCost: SPIN_COST,
      flagCost: FLAG_COST,
      clientSeed: player.clientSeed,
      serverSeedHash: player.serverSeedHash,
      nonce: player.nonce,
      next: nextCommitment(),
      ...extra,
    });
  }

  sendState();

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return send({ type: "error", message: "Bad request." });
    }

    if (msg.type === "setClientSeed" && typeof msg.seed === "string" && msg.seed.length <= 64) {
      player.clientSeed = msg.seed;
      player.nonce = 0;
      return sendState({ message: "Client seed updated. Nonce reset." });
    }

    if (msg.type === "spin") {
      if (player.cash < SPIN_COST) {
        return send({ type: "error", message: "Not enough cash to spin." });
      }
      player.cash -= SPIN_COST;

      const { result, hmac } = deriveResult(player.serverSeed, player.clientSeed, player.nonce);
      const isTriple = result[0] === result[1] && result[1] === result[2];
      let win = 0;

      if (isTriple) {
        const symbol = SYMBOLS.find((s) => s.emoji === result[0]);
        player.streak += 1;
        win = Math.round(symbol.payout * Math.pow(STREAK_MULTIPLIER, player.streak - 1));
        player.cash += win;
      } else {
        player.streak = 0;
      }

      const usedNonce = player.nonce;
      player.nonce += 1;

      return send({
        type: "spin",
        status: "revealed",
        cash: player.cash,
        streak: player.streak,
        result: { symbols: result, hmac, nonce: usedNonce, win },
        next: nextCommitment(),
      });
    }

    // VULNERABILITY: generating a new seed immediately leaks its own
    // plaintext alongside its commitment hash, before it has ever been
    // wagered on. A real provably-fair system commits to a seed (hash
    // only) and reveals the plaintext *after* it's retired, never while
    // it's still the live seed a spin would use.
    if (msg.type === "rotate") {
      player.serverSeed = newSeed();
      player.serverSeedHash = sha256(player.serverSeed);
      player.nonce = 0;

      return sendState({
        rotated: { serverSeed: player.serverSeed, serverSeedHash: player.serverSeedHash, nonceCount: player.nonce },
      });
    }

    if (msg.type === "redeem") {
      if (player.cash >= FLAG_COST) {
        return send({ type: "flag", cash: player.cash, flag: FLAG });
      }
      return send({ type: "flag", cash: player.cash, flag: "Not enough cash yet." });
    }

    send({ type: "error", message: "Unknown message type." });
  });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  server.listen(PORT, () => console.log(`Fair Gambling (hard) running on :${PORT}`));
}

module.exports = server;