import {
  makeWASocket,
  useMultiFileAuthState,
  generateWAMessageFromContent,
  DisconnectReason,
  Browsers,
} from "baileys";
import { createInterface } from "node:readline";
import { keepAlive } from "./keepAlive.js";
import { Boom } from "@hapi/boom";
import pino from "pino";

async function connectToWA() {
  const version = process.versions.node.split(".")[0];

  if (+version < 18) {
    console.log("Necesitas Node.js versión 18 o superior.");
    return;
  }

  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const browser = Browsers.appropriate("chrome");

  const socket = makeWASocket({
    logger: pino({ level: "silent" }),
    //version: [2, 3000, 1015901307],
    mobile: false,
    auth: state,
    browser,
  });

  if (!socket.authState.creds.registered) {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = (input) => {
      return new Promise((resolve) => readline.question(input, resolve));
    };

    const number = await prompt(`Introduce tu número de WhatsApp: `);
    const formatNumber = number.replace(/[\s()+-]/g, "");

    const code = await socket.requestPairingCode(formatNumber);

    console.log("Tu código de conexión es:", code);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect.error instanceof Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log(
        "Conexión cerrada debido a",
        lastDisconnect.error + ", reconectando...",
        shouldReconnect
      );

      if (shouldReconnect) {
        connectToWA();
      }
    } else if (connection === "open") {
      keepAlive();
      console.log("App ready!");
    }
  });

  socket.ev.on("messages.upsert", async ({ type, messages }) => {
    if (!messages[0]?.message) return;

    if (type !== "notify") return;

    if (messages[0]?.key?.fromMe) return;

    const { message, key } = messages[0];
    const from = key.remoteJid;
    const msgType = Object.keys(message)[0];
    const body = message.conversation || message[msgType]?.text || "";

    // Manejo del comando /menu
    if (body === "/menu") {
      const buttons = [
        { buttonId: "id1", buttonText: { displayText: "Botón 1" }, type: 1 },
        { buttonId: "id2", buttonText: { displayText: "Botón 2" }, type: 1 },
        { buttonId: "id3", buttonText: { displayText: "Botón 3" }, type: 1 },
      ];
      const buttonMessage = {
        text: "Este es el menú con botones",
        buttons: buttons,
        headerType: 1,
      };
      await socket.sendMessage(from, buttonMessage);
    }

    // Manejo de respuestas de botones
    if (msgType === "buttonsResponseMessage") {
      const selectedButtonId = message.buttonsResponseMessage.selectedButtonId;
      if (selectedButtonId === "id1") {
        await socket.sendMessage(from, { text: "Has seleccionado el Botón 1" });
      } else if (selectedButtonId === "id2") {
        await socket.sendMessage(from, { text: "Has seleccionado el Botón 2" });
      } else if (selectedButtonId === "id3") {
        await socket.sendMessage(from, { text: "Has seleccionado el Botón 3" });
      }
    }

    const pattern =
      /^(messageContextInfo|senderKeyDistributionMessage|viewOnceMessage(?:V2(?:Extension)?)?)$/;

    if (!pattern.test(msgType)) return;

    const lastKey = Object.keys(message).at(-1);
    if (!/^viewOnceMessage(?:V2(?:Extension)?)?$/.test(lastKey)) return;

    const fileType = Object.keys(message[lastKey].message)[0];

    delete message[lastKey].message[fileType].viewOnce;

    if (!socket?.user?.id) return;

    const proto = generateWAMessageFromContent(key.remoteJid, message, {});

    socket.relayMessage(socket.user.id, proto.message, {
      messageId: proto.key.id,
    });
  });

  socket.ev.on("creds.update", saveCreds);
}

connectToWA();

process.on("uncaughtExceptionMonitor", console.error);
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
