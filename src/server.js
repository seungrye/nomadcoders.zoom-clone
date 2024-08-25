import express from "express"
import http from "http"
import WebSocket from "ws"

const app = express()

app.set("view engine", "pug")
app.set("views", __dirname + "/views")

app.use("/public", express.static(__dirname + "/public"))

app.get("/", (
  _,
  res) => {
  res.render("home");
});

// fallback
app.get("/*", (
  _,
  res) => {
  res.redirect("/");
})

const handleListen = () => console.log("Listening on http://localhost:3000");
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const sockets = [];

wss.on("connection", (socket) => {
  console.log("Connected to browser");

  sockets.push(socket);

  socket["nickname"] = "anon";

  socket.onclose = () => console.log("disconnected from the browser");
  socket.onmessage = ({ data: message }) => {
    const parsed = JSON.parse(message);
    switch (parsed.type) {
      case "new_message":
        sockets.forEach(sock => (sock != socket) && sock.send(`${socket.nickname} : ${parsed.payload}`));
        break;
      case "nickname":
        socket["nickname"] = parsed.payload;
        break;
      default:
        console.log("unknonw type : ", parsed.type);
        break;
    }
  };
});

server.listen(3000, handleListen);
