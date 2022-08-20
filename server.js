const express = require("express");
const cors = require("cors");
const useSocket = require("socket.io");

const app = express();
app.use(cors());
const server = require("http").Server(app);
const io = useSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rooms = new Map();

app.get("/rooms/:id", (req, res) => {
  const { id: roomID } = req.params;
  const obj = rooms.has(roomID)
    ? {
        users: [...rooms.get(roomID).get("users").values()],
        messages: [...rooms.get(roomID).get("messages").values()],
      }
    : { users: [], messages: [] };
  res.json(obj);
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
  socket.on("ROOM:JOIN", ({ roomID, userName }) => {
    socket.join(roomID);
    rooms.get(roomID).get("users").set(socket.id, userName);
    const users = [...rooms.get(roomID).get("users").values()];
    socket.broadcast.except(roomID).emit("ROOM:SET_USERS", users);
  });

  socket.on("disconnect", () => {
    rooms.forEach((value, roomID) => {
      if (value.get("users").delete(socket.id)) {
        const users = [...value.get("users").values()];
        socket.to(roomID).broadcast.emit("ROOM:SET_USERS", users);
      }
    });
  });
  console.log("socket connected", socket.id);
});

server.listen(5000, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log("server is running");
});
