import {
    makeWASocket,
    useMultiFileAuthState,
    generateWAMessageFromContent,
    DisconnectReason,
    Browsers,
    prepareWAMessageMedia,
} from "baileys";
import { createInterface } from "node:readline";
import { keepAlive } from "./keepAlive.js";
import { Boom } from "@hapi/boom";
import { pino } from "pino";
import { randomBytes } from "crypto";
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
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const browser = Browsers.appropriate("chrome");

    const socket = makeWASocket({
        logger: pino({ level: "silent" }),
        mobile: false,
        auth: state,
        browser
    });

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

        if (body.startsWith(config.prefix)) {
            const args = body.slice(config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            switch(command) {
                case 'button1':
                    await sendQuickReplyButton(socket, from);
                    break;
                case 'button2':
                    await sendCopyCodeButton(socket, from);
                    break;
                case 'button3':
                    await sendCallButton(socket, from);
                    break;
                case 'button4':
                    await sendInteractiveButton(socket, from);
                    break;
                default:
                    await socket.sendMessage(from, { text: `Comando desconocido: ${command}` });
                    break;
            }
        }
    });

    socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect = 
                (lastDisconnect.error instanceof Boom)?.output?.statusCode !== 
                DisconnectReason.loggedOut;

            if (shouldReconnect) {
                connectToWA();
            }
        } else if (connection === "open") {
            keepAlive();
            console.log("¡Bot conectado y listo!");
        }
    });

    socket.ev.on("creds.update", saveCreds);
}

// Funciones auxiliares para los botones
async function sendQuickReplyButton(socket, jid) {
    const messageContent = {
        interactiveMessage: {
            body: { text: 'Ejemplo de botón de respuesta rápida' },
            nativeFlowMessage: {
                buttons: [
                    {
                        buttonParamsJson: JSON.stringify({
                            display_text: "¡Responde!",
                            id: "quick_reply_option",
                        }),
                        name: "quick_reply",
                    },
                ],
                messageParamsJson: "{}",
                messageVersion: 1,
            },
        },
    };

    const proto = generateWAMessageFromContent(jid, messageContent, { userJid: socket.user.id });
    await socket.relayMessage(jid, proto.message, { messageId: proto.key.id });
}

async function sendCopyCodeButton(socket, jid) {
    const messageContent = {
        interactiveMessage: {
            body: { text: 'Ejemplo de botón para copiar código' },
            nativeFlowMessage: {
                buttons: [
                    {
                        buttonParamsJson: JSON.stringify({
                            display_text: "Copiar este código",
                            id: "copy_code",
                            copy_code: "123456",
                        }),
                        name: "cta_copy",
                    },
                ],
                messageParamsJson: "{}",
                messageVersion: 1,
            },
        },
    };

    const proto = generateWAMessageFromContent(jid, messageContent, { userJid: socket.user.id });
    await socket.relayMessage(jid, proto.message, { messageId: proto.key.id });
}

async function sendCallButton(socket, jid) {
    const messageContent = {
        interactiveMessage: {
            body: { text: 'Ejemplo de botón para llamada' },
            nativeFlowMessage: {
                buttons: [
                    {
                        buttonParamsJson: JSON.stringify({
                            display_text: "Llamar al soporte",
                            phone_number: "1234567890",
                        }),
                        name: "cta_call",
                    },
                ],
                messageParamsJson: "{}",
                messageVersion: 1,
            },
        },
    };

    const proto = generateWAMessageFromContent(jid, messageContent, { userJid: socket.user.id });
    await socket.relayMessage(jid, proto.message, { messageId: proto.key.id });
}

async function sendInteractiveButton(socket, jid) {
    const sections = [
        {
            title: "Opciones Avanzadas",
            rows: [
                { title: "Opción 1", description: "Descripción de Opción 1", id: "opcion_1" },
                { title: "Opción 2", description: "Descripción de Opción 2", id: "opcion_2" },
            ],
        },
    ];

    const messageContent = {
        interactiveMessage: {
            body: { text: 'Ejemplo de botón interactivo con opciones' },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "Menú de Opciones",
                            sections: sections,
                        }),
                    },
                ],
                messageParamsJson: "{}",
                messageVersion: 1,
            },
        },
    };

    const proto = generateWAMessageFromContent(jid, messageContent, { userJid: socket.user.id });
    await socket.relayMessage(jid, proto.message, { messageId: proto.key.id });
}

// Iniciar el bot
await connectToWA();
