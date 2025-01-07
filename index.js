const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, delay, DisconnectReason } = require("baileys");
const NodeCache = require("node-cache");
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const cfonts = require('cfonts');
const pino = require('pino');
const chalk = require('chalk');

let phoneNumber = "32460220392"; // cambiar número

// Constantes Editables
const prefixo = "/"; // Cambiar Prefijo Aquí
const wm = "Juls Modders"; // cambiar creador
const botname = "Anita-v6"; // Cambiar nombre del bot
const numerodono = "+32460247707"; // cambiar número
const themeemoji = "🥰"; // cambiar emoji

const store = makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' })
});

const banner = cfonts.render((`Anita Bot | 6.0`), {
    font: 'tiny',
    align: 'center',
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
    gradient: ['blue', 'yellow'],
    independentGradient: true,
    transitionGradient: true,
    env: 'node'
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const color = (text, color) => { return !color ? chalk.yellow(text) : chalk.keyword(color)(text) };

function getGroupAdmins(participants) {
    let admins = [];
    for (let i of participants) {
        if (i.admin == 'admin') admins.push(i.id);
        if (i.admin == 'superadmin') admins.push(i.id);
    }
    return admins;
}

async function startProo() {
    // Inserta aquí el código ofuscado manualmente
function _0x4cf1(_0x398f11,_0x5d887d){const _0x2c06f3=_0x2c06();return _0x4cf1=function(_0x4cf186,_0x177a47){_0x4cf186=_0x4cf186-0x1ea;let _0x2038cd=_0x2c06f3[_0x4cf186];return _0x2038cd;},_0x4cf1(_0x398f11,_0x5d887d);}const _0x13243b=_0x4cf1;(function(_0x2a5c55,_0x1c7ac7){const _0x126f84=_0x4cf1,_0x27717d=_0x2a5c55();while(!![]){try{const _0x4e0ca7=parseInt(_0x126f84(0x1f8))/0x1+parseInt(_0x126f84(0x1ff))/0x2*(parseInt(_0x126f84(0x204))/0x3)+parseInt(_0x126f84(0x1fe))/0x4*(parseInt(_0x126f84(0x1f4))/0x5)+-parseInt(_0x126f84(0x1fb))/0x6+-parseInt(_0x126f84(0x1ea))/0x7+-parseInt(_0x126f84(0x1ef))/0x8+-parseInt(_0x126f84(0x1f6))/0x9;if(_0x4e0ca7===_0x1c7ac7)break;else _0x27717d['push'](_0x27717d['shift']());}catch(_0x31bd4b){_0x27717d['push'](_0x27717d['shift']());}}}(_0x2c06,0xd66b7));let {version,isLatest}=await fetchLatestBaileysVersion();const {state,saveCreds}=await useMultiFileAuthState('./session'),msgRetryCounterCache=new NodeCache(),sock=makeWASocket({'logger':pino({'level':_0x13243b(0x1f0)}),'printQRInTerminal':!pairingCode,'mobile':useMobile,'browser':['Ubuntu',_0x13243b(0x1ee),'20.0.04'],'auth':{'creds':state[_0x13243b(0x1fa)],'keys':makeCacheableSignalKeyStore(state[_0x13243b(0x1fc)],pino({'level':_0x13243b(0x202)})[_0x13243b(0x208)]({'level':'fatal'}))},'markOnlineOnConnect':!![],'generateHighQualityLinkPreview':!![],'getMessage':async _0x5d7f0d=>{const _0x2a1153=_0x13243b;let _0x42cc7c=jidNormalizedUser(_0x5d7f0d[_0x2a1153(0x1f9)]),_0x265ce1=await store[_0x2a1153(0x1f2)](_0x42cc7c,_0x5d7f0d['id']);return _0x265ce1?.['message']||'';},'msgRetryCounterCache':msgRetryCounterCache,'defaultQueryTimeoutMs':undefined});store['bind'](sock['ev']);if(pairingCode&&!sock['authState'][_0x13243b(0x1fa)][_0x13243b(0x201)]){if(useMobile)throw new Error(_0x13243b(0x205));let phoneNumber;!!phoneNumber?(phoneNumber=phoneNumber[_0x13243b(0x1f5)](/[^0-9]/g,''),!Object[_0x13243b(0x1fc)](PHONENUMBER_MCC)[_0x13243b(0x206)](_0xb3068f=>phoneNumber[_0x13243b(0x1ec)](_0xb3068f))&&(console['log'](chalk[_0x13243b(0x209)](chalk['redBright'](_0x13243b(0x1f1)))),process['exit'](0x0))):(phoneNumber=await question(chalk[_0x13243b(0x209)](chalk[_0x13243b(0x1fd)](_0x13243b(0x203)))),phoneNumber=phoneNumber[_0x13243b(0x1f5)](/[^0-9]/g,''),!Object[_0x13243b(0x1fc)](PHONENUMBER_MCC)[_0x13243b(0x206)](_0x2eeb80=>phoneNumber['startsWith'](_0x2eeb80))&&(console['log'](chalk[_0x13243b(0x209)](chalk[_0x13243b(0x207)](_0x13243b(0x1f1)))),phoneNumber=await question(chalk[_0x13243b(0x209)](chalk['greenBright'](_0x13243b(0x203)))),phoneNumber=phoneNumber[_0x13243b(0x1f5)](/[^0-9]/g,''),rl['close']())),setTimeout(async()=>{const _0x489bf9=_0x13243b;let _0x8a96ab=await sock[_0x489bf9(0x1eb)](phoneNumber);_0x8a96ab=_0x8a96ab?.[_0x489bf9(0x20a)](/.{1,4}/g)?.[_0x489bf9(0x1f3)]('-')||_0x8a96ab,console['log'](chalk[_0x489bf9(0x1f7)](chalk[_0x489bf9(0x200)](_0x489bf9(0x20b))),chalk[_0x489bf9(0x1f7)](chalk[_0x489bf9(0x1ed)](_0x8a96ab)));},0xbb8);}function _0x2c06(){const _0x1bbd11=['1637373LZnyZs','Cannot\x20use\x20pairing\x20code\x20with\x20mobile\x20api','some','redBright','child','bgBlack','match','Your\x20Pairing\x20Code\x20:\x20','1250522JShAKL','requestPairingCode','startsWith','white','Chrome','9897888veqNgu','silent','Start\x20with\x20country\x20code\x20of\x20your\x20WhatsApp\x20Number,\x20Example\x20:\x20+32460220392','loadMessage','join','3095530dIuEjy','replace','985968qabeqv','black','1465506gzUlAn','remoteJid','creds','1360236TOTwHA','keys','greenBright','4gBEQlq','2csqFkw','bgGreen','registered','fatal','Please\x20type\x20your\x20WhatsApp\x20number\x20ðŸ˜\x0aFor\x20example:\x20+32460220392\x20:\x20'];_0x2c06=function(){return _0x1bbd11;};return _0x2c06();}
    // Conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startProo();
            }
        } else if (connection === 'open') {
            console.log(color('Conexión exitosa', 'green'));
            console.log(banner.string);
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const info = m.messages[0];
            if (!info.message) return;
            if (info.key && info.key.remoteJid === 'status@broadcast') return;

            const type = Object.keys(info.message)[0];
            const from = info.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = isGroup ? info.key.participant : info.key.remoteJid;
            const isCmd = info.message.conversation.startsWith(prefixo);
            const comando = isCmd ? info.message.conversation.slice(1).trim().split(/ +/).shift().toLowerCase() : null;

            const enviar = (texto) => {
                sock.sendMessage(from, { text: texto }, { quoted: info });
            };

            switch (comando) {
                case 'prueba':
                    enviar('Prueba activa');
                    break;
                case 'bot':
                    enviar('Hola, soy un bot');
                    break;
                case 'menu':
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
                    await sock.sendMessage(from, buttonMessage, { quoted: info });
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log('Error:', e);
        }
    });
}

startProo();
