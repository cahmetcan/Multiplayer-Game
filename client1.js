const ws = require("ws");

const wsClient = new ws("ws://0.0.0.0:8787/play?room=oda2&name=ahmed2");

wsClient.on("open", () => {
  wsClient.send("rooms");
});
