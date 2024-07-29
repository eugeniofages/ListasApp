const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { db, auth } = require("./firebase");
const { sendNotification } = require("./websocket");
require('dotenv').config();

const authenticate = require("./middleware/authMiddleware");
const socketIo = require("socket.io");
const http = require("http");
const app = express();
const publicAuthRoutes = require("./routes/publicAuth");
const protectedAuthRoutes = require("./routes/protectedAuth");
app.use(bodyParser.json());
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "http://localhost:5173" } });
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});
server.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});

const taskListsRouter = require("./routes/taskLists")(io);

app.use("/api/taskLists", authenticate, taskListsRouter);
app.use("/api/auth", publicAuthRoutes);

app.use("/api/auth", protectedAuthRoutes);

