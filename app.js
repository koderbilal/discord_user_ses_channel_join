// const Discord = require('discord.js');
const swanex = require("./ayarlar.json");
const WebSocket = require("ws")

for (let index = 0; index < swanex.botTOKEN.length; index++) {
    const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json")

let voiceStateUpdateInterval;
let sessionId;
let lastHeartbeatAck;

const serverId = swanex.guild_id;
const voiceChannelId = swanex.channel_id;
const token = swanex.botTOKEN[index];

ws.on("open", function open() {
  console.log('başarılı bir şekilde aktif oldu.');
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
});

ws.on("message", function incoming(data) {
  const payload = JSON.parse(data);

  if (payload.op === 10) {
    const { heartbeat_interval } = payload.d;
    const heartbeat = () => {
      ws.send(JSON.stringify({ op: 1, d: `${payload.s == null ? "null" : payload.s.reverse().split("")[0]}` }));
    };

    setInterval(() => {
      heartbeat();
    }, heartbeat_interval);

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
  }
   if (payload.t === "READY") {
    //console.log(payload)
    const { username } = payload.d.user;
    console.log(`[${index}] Kullanıcı Adı: ${username} giriş yaptı`);
  }

  if (payload.t === "VOICE_STATE_UPDATE") {
    const { session_id } = payload.d;
    sessionId = session_id;
  }

  if (payload.op === 4) {
    const { voice_state_update } = payload;
    if (
      voice_state_update.channel_id === voiceChannelId &&
      voice_state_update.guild_id === serverId
    ) {
      sessionId = voice_state_update.session_id;
      clearInterval(voiceStateUpdateInterval);
      console.log("Joined the voice channel!");
    }
  }

  if (payload.op === 11) {
    lastHeartbeatAck = payload.s;
  }
});

}