import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";

const dir = process.env.SESSION_DIR ?? "./session";

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const sock = makeWASocket({ auth: state });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("Scan this QR code with WhatsApp (Linked devices):");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") console.log("Connected to WhatsApp");
    if (connection === "close") {
      const loggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      console.log(loggedOut ? "Logged out: delete the session volume and restart to link again." : "Connection closed, reconnecting…");
      if (!loggedOut) setTimeout(start, 3000);
    }
  });
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const m of messages) {
      const text = m.message?.conversation ?? m.message?.extendedTextMessage?.text;
      if (!m.key.fromMe && text?.trim().toLowerCase() === "ping") await sock.sendMessage(m.key.remoteJid, { text: "pong 🏓 (from SKYHOST)" });
    }
  });
}

start();
