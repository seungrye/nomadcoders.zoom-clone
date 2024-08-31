import express from "express"
import http from "http"
import SocketIO from "socket.io"

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
const httpServer = http.createServer(app)
const wsServer = SocketIO(httpServer);
wsServer.on("connection", (socket) => {
  socket['nickname'] = "Anonymous";

  socket.onAny(e => console.log("socket event : ", e));

  socket.on("enter-room", ({ payload: room }, done) => {
    socket.join(room);
    console.log(socket.rooms)
    done();
    socket.to(room).emit("hello", socket.nickname);
  })

  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
  })

  socket.on("nickname", ({ payload: nickname }) => {
    socket['nickname'] = nickname;
  });

  socket.on("new_message", ({ payload: message, room: room }, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${message}`);
    done();
  })
});


/*
const wss = new WebSocket.Server({ server })
//const sockets = [];

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
  */

httpServer.listen(3000, handleListen);
