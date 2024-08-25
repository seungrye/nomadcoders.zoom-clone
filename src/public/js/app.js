const websocket = new WebSocket(`ws://${window.location.host}`);

websocket.onopen = () => {
  console.log("connected");
};

websocket.onmessage = (message) => {
  console.log("message from server : ", message.data);
};

websocket.onclose = () => {
  console.log("disconnected");
}

setTimeout(() => {
  websocket.send("send from browser");
}, 1000);
