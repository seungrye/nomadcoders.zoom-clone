const websocket = new WebSocket(`ws://${window.location.host}`);
websocket.onopen = () => {
  console.log("connected");
};
websocket.onmessage = (message) => {
  console.log(message);
};
