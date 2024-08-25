const websocket = new WebSocket(`ws://${window.location.host}`);

websocket.onopen = () => {
  console.log("connected");
};

websocket.onmessage = (message) => {
  console.log(message.data);
};

websocket.onclose = () => {
  console.log("disconnected");
}
