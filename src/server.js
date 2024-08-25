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

wss.on("connection", (socket) => {
  socket.send("hello WebSocket")
  socket.onclose = () => console.log("disconnected from the browser");
  console.log(socket);
});

server.listen(3000, handleListen);
