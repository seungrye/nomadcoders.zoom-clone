const messageList = document.querySelector("ul")
const messageForm = document.querySelector("form")
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

messageForm.onsubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  websocket.send(input.value);
  input.value = "";
}
