const messageList = document.querySelector("ul")
const nicknameForm = document.querySelector("form#nickname")
const messageForm = document.querySelector("form#message")
const websocket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

websocket.onopen = () => {
  console.log("connected");
};

websocket.onmessage = (message) => {
  console.log(message.data);
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
};

websocket.onclose = () => {
  console.log("disconnected");
}

nicknameForm.onsubmit = (event) => {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  websocket.send(makeMessage("nickname", input.value));
}

messageForm.onsubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  websocket.send(makeMessage("new_message", input.value));

  const li = document.createElement("li");
  li.innerText = `You : ${input.value}`;
  messageList.append(li);

  input.value = "";
}
