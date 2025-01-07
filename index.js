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
import { pino } from "pino";
import fs from 'fs/promises';
import path from 'path';

// Configuración del bot
const config = {
    botName: '🤖 Walter Bot',
    ownerNumber: '549XXXXXXXXX', // Tu número
    prefix: '!',
    version: '1.0.0',
    groupLink: 'https://chat.whatsapp.com/tugrupo',
    githubRepo: 'https://github.com/turepo'
};

// Sistema de registro
const logger = pino({
    level: 'silent',
    transport: {
        target: 'pino-pretty'
    }
});

// Función principal de conexión
async function connectToWA() {
    // Verificación de versión de Node
    const version = process.versions.node.split(".")[0];
    if (+version < 18) {
        console.log("Necesitas Node.js versión 18 o superior.");
        return;
    }

    // Configuración de autenticación
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const browser = Browsers.appropriate("chrome");

    // Crear socket de conexión
    const socket = makeWASocket({
        logger: pino({ level: "silent" }),
        mobile: false,
        auth: state,
        browser
    });

    // Manejo de autenticación inicial
    if (!socket.authState.creds.registered) {
        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const prompt = (input) => new Promise((resolve) => readline.question(input, resolve));
        const number = await prompt("Introduce tu número de WhatsApp: ");
        const formatNumber = number.replace(/[\s()+-]/g, "");
        const code = await socket.requestPairingCode(formatNumber);
        console.log("Tu código de conexión es:", code);
        readline.close();
    }

    // Manejador de mensajes
    socket.ev.on("messages.upsert", async ({ type, messages }) => {
        if (!messages[0]?.message) return;
        if (type !== "notify") return;
        if (messages[0]?.key?.fromMe) return;

        const msg = messages[0];
        const from = msg.key.remoteJid;
        const body = msg.message?.conversation || 
                    msg.message?.imageMessage?.caption || 
                    msg.message?.videoMessage?.caption || 
                    msg.message?.extendedTextMessage?.text || '';

        // Comandos sin prefijo
        switch(body.toLowerCase()) {
            case 'menu':
                await sendMenu(socket, from);
                break;
            case 'hola':
                await socket.sendMessage(from, { text: '👋 ¡Hola! ¿En qué puedo ayudarte?' });
                break;
            case 'bot':
                await socket.sendMessage(from, { text: '✅ Bot activo y funcionando' });
                break;
            case 'ping':
                await socket.sendMessage(from, { text: '🚀 Pong!' });
                break;
        }

        // Comandos con prefijo
        if (body.startsWith(config.prefix)) {
            const args = body.slice(config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            switch(command) {
                case 'help':
                    await sendHelp(socket, from);
                    break;
                case 'sticker':
                    await createSticker(socket, msg, from);
                    break;
                // Añade más comandos aquí
            }
        }

        // Procesamiento de mensajes view-once
        const msgType = Object.keys(msg.message)[0];
        const pattern = /^(messageContextInfo|senderKeyDistributionMessage|viewOnceMessage(?:V2(?:Extension)?)?)$/;
        
        if (pattern.test(msgType)) {
            const lastKey = Object.keys(msg.message).at(-1);
            if (/^viewOnceMessage(?:V2(?:Extension)?)?$/.test(lastKey)) {
                const fileType = Object.keys(msg.message[lastKey].message)[0];
                delete msg.message[lastKey].message[fileType].viewOnce;
                
                if (socket?.user?.id) {
                    const proto = generateWAMessageFromContent(from, msg.message, {});
                    socket.relayMessage(socket.user.id, proto.message, {
                        messageId: proto.key.id
                    });
                }
            }
        }
    });

    // Manejador de conexión
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
            console.log("¡Bot conectado y listo!");
        }
    });

    // Manejador de credenciales
    socket.ev.on("creds.update", saveCreds);
}

// Funciones auxiliares
async function sendMenu(socket, jid) {
    const menuText = `
╭━━⊰ *MENU PRINCIPAL* ⊱━━━╮
┃
┃ 💫 *COMANDOS DISPONIBLES*
┃ 
┃ ➸ *!help* - Ayuda detallada
┃ ➸ *!sticker* - Crear sticker
┃ ➸ *!ping* - Test de velocidad
┃ ➸ *!owner* - Creador del bot
┃
┃ 🤖 *COMANDOS SIN PREFIJO*
┃
┃ ➸ *menu* - Este menú
┃ ➸ *hola* - Saludar al bot
┃ ➸ *bot* - Verificar estado
┃
╰━━━━━━━━━━━━━━━━━╯`;

    await socket.sendMessage(jid, {
        text: menuText,
        footer: `©️ ${config.botName} | v${config.version}`,
        buttons: [
            { buttonId: 'help', buttonText: { displayText: '📚 Ayuda' }, type: 1 },
            { buttonId: 'owner', buttonText: { displayText: '👑 Creador' }, type: 1 }
        ]
    });
}

async function sendHelp(socket, jid) {
    const helpText = `
📚 *GUÍA DE USO*

*1.* Para crear stickers:
- Envía una imagen con el comando *!sticker*
- O responde a una imagen con *!sticker*

*2.* Comandos básicos:
- *!ping* - Ver velocidad del bot
- *!owner* - Información del creador

*3.* Soporte:
- Grupo: ${config.groupLink}
- GitHub: ${config.githubRepo}
`;

    await socket.sendMessage(jid, { text: helpText });
}

async function createSticker(socket, msg, jid) {
    // Implementa la lógica para crear stickers aquí
    await socket.sendMessage(jid, { text: 'Función de stickers en desarrollo' });
}

// Iniciar el bot
await connectToWA();

// Manejo de errores globales
process.on("uncaughtExceptionMonitor", console.error);
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
