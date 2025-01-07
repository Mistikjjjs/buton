import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
} from "baileys";
import { createInterface } from "node:readline";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import pino from "pino";

// Node.js versión >= 20
ffmpeg.setFfmpegPath(path);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function connectToWhatsApp() {
  const question = (txt) => new Promise((resolve) => rl.question(txt, resolve));

  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const socket = makeWASocket({
    auth: state,
    //version: [2, 3000, 1015901307],
    logger: pino({ level: "silent" }),
    browser: Browsers.appropriate("chrome"),
  });

  if (!socket.authState.creds.registered) {
    const number = await question(`Escribe tú número de WhatsApp:`);
    const formatNumber = number.replace(/[\s+\-()]/g, "");
    const code = await socket.requestPairingCode(formatNumber);
    console.log(`Tu codigo de conexión es: ${code}`);
  }

  socket.ev.on("creds.update", saveCreds);

  // Manejo de mensajes
  socket.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    if (msg.key && msg.key.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const type = Object.keys(msg.message)[0];
    const body = msg.message.conversation || msg.message[type].caption || msg.message[type].text;

    if (body === '/menu') {
      const buttons = [
        { buttonId: 'id1', buttonText: { displayText: 'Botón 1' }, type: 1 },
        { buttonId: 'id2', buttonText: { displayText: 'Botón 2' }, type: 1 },
        { buttonId: 'id3', buttonText: { displayText: 'Botón 3' }, type: 1 }
      ];
      const buttonMessage = {
        text: 'Este es el menú con botones',
        buttons: buttons,
        headerType: 1
      };
      await socket.sendMessage(from, buttonMessage);
    }

    // Manejo de respuestas de botones
    if (type === 'buttonsResponseMessage') {
      const selectedButtonId = msg.message.buttonsResponseMessage.selectedButtonId;
      if (selectedButtonId === 'id1') {
        await socket.sendMessage(from, { text: 'Has seleccionado el Botón 1' });
      } else if (selectedButtonId === 'id2') {
        await socket.sendMessage(from, { text: 'Has seleccionado el Botón 2' });
      } else if (selectedButtonId === 'id3') {
        await socket.sendMessage(from, { text: 'Has seleccionado el Botón 3' });
      }
    }
  });
}

connectToWhatsApp();

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
process.on("uncaughtExceptionMonitor", console.error);
