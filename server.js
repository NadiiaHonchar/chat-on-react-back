const express = require("express");
const cors = require("cors");
const useSocket = require("socket.io");

const app = express();
app.use(cors());
const server = require("http").Server(app);
const io = useSocket(server);

app.use(express.json());

const rooms = new Map();

app.get("/rooms", (req, res) => {
  res.json(rooms);
});

app.post("/rooms", (req, res) => {
  const { roomID, userName } = req.body;
  if (!rooms.has(roomID)) {
    rooms.set(
      roomID,
      new Map([
        ["users", new Map()],
        ["messages", []],
      ])
    );
  }
  res.send();
});

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
});

server.listen(5000, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log("server is running");
});
