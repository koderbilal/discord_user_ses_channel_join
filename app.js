// const Discord = require('discord.js');
const swanex = require("./ayarlar.json");
const WebSocket = require("ws")

for (let index = 0; index < swanex.botTOKEN.length; index++) {
 const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json")

 const intents = 513;  // Include necessary intents
let voiceStateUpdateInterval;
let sessionId;
let lastHeartbeatAck;
let voiceServer;
let voiceWs;
let heartbeatInterval;
let voiceHeartbeatInterval;

// discord'a bağlantı
const serverId = swanex.guild_id;
const voiceChannelId = swanex.channel_id;
const token = swanex.botTOKEN[index];

ws.on("open", function open() {
  
    const payload = {
      op: 2,
      d: {
        token: token,
        intents: 513,
        properties: {
          $os: "linux",
          $browser: "chrome",
          $device: "chrome",
        },
      },
    };
    ws.send(JSON.stringify(payload));
    console.log('başarılı bir şekilde aktif oldu.');
  });


// 
ws.on('message', async (data) => {
    const payload = JSON.parse(data);
    if(payload.op === 10){
        const { heartbeat_interval } = payload.d;
    const heartbeat = () => {
      ws.send(JSON.stringify({ op: 1, d: `${payload.s == null ? "null" : payload.s.reverse().split("")[0]}` }));
    };

    setInterval(() => {
      heartbeat();
    }, heartbeat_interval);
    }
    if(payload.op === 0 && payload.t === "READY"){
    const { username } = payload.d.user;
    console.log(`[${index}] Kullanıcı Adı: ${username} giriş yaptı`);
    // ses kanalına bağlanma
        ws.send(
            JSON.stringify({
              op: 4,
              d: {
                guild_id: serverId,
                channel_id: voiceChannelId,
                self_mute: false,
                self_deaf: false,
              },
            })
          );
          sessionId = payload.d.session_id;
    }
    if(payload.t === "VOICE_SERVER_UPDATE"){
         voiceServer = payload.d
         
         voiceWs = new WebSocket(`wss://${voiceServer.endpoint}/?v=4`);
         voiceWs.on('open', () => {
           const identifyPayload = {
               op: 8,
               d: {
                   heartbeat_interval: 41250
               },
           };
           voiceWs.send(JSON.stringify(identifyPayload));
           
          
           voiceWs.on('message', (data) => {
               const payload = JSON.parse(data);
               //console.log(payload)
               switch (payload.op) {
                case 2:
                    startVoiceHeartbeat(payload.d.heartbeat_interval);
                    break;
                    case 8:
                      startVoiceHeartbeat(payload.d.heartbeat_interval);
            }
           });
           
         });

    }
    
});


function startVoiceHeartbeat(interval) {
    voiceHeartbeatInterval = setInterval(() => {
        voiceWs.send(JSON.stringify({ op: 3, d: Date.now() }));
    }, interval);
}
}