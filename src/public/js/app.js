const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName = "";

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li")
  li.innerText = message;
  ul.appendChild(li)
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector("input");

  socket.emit("enter-room", { payload: input.value }, () => {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const nameForm = room.querySelector("#name");
    nameForm.onsubmit = (event) => {
      event.preventDefault();
      const input = nameForm.querySelector("input");
      socket.emit("nickname", { payload: input.value });
    };

    const msgForm = room.querySelector("#msg");
    msgForm.onsubmit = (event) => {
      event.preventDefault();
      const input = msgForm.querySelector("input");
      socket.emit("new_message", { payload: input.value, room: roomName }, () => {
        addMessage(`You: ${input.value}`);
        input.value = "";
      });
    };
  });

  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit)

socket.on("hello", (nickname) => {
  addMessage(`${nickname} joined`);
});
socket.on("bye", (nickname) => {
  addMessage(`${nickname} left`);
});
socket.on("new_message", (message) => {
  addMessage(message);
});
