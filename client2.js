const WebSocket = require("ws");

const url = "wss://agario.ahmetcanisik5458675.workers.dev/play";
const localUrl = "ws://0.0.0.0:8787/play?name=bediran&roomId=112";
const ws = new WebSocket(localUrl);

ws.onopen = () => {
  console.log("connected");
};

ws.onmessage = (msg) => {
  console.log(msg.data);
};

setTimeout(() => {
  console.log("sending");
  ws.send(
    JSON.stringify({
      type: "move",
      data: "w",
    })
  );
}, 2000);
