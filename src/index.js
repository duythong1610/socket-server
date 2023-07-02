const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const ChatHistory = require("./models/ChatHistory"); // Import schema

dotenv.config();

const port = process.env.PORT || 3002;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

routes(app);
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Connect successfully");
  })
  .catch((err) => {
    console.log(err);
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

function handleIncomingMessage(data) {
  const { userId, messageChat, userName, timeChat } = data;

  const newChat = new ChatHistory({
    userId: userId,
    content: messageChat,
  });

  newChat
    .save()
    .then((savedChat) => {
      console.log("Chat history saved:", savedChat);
    })
    .catch((error) => {
      console.error("Error saving chat history:", error);
    });
}

io.on("connection", (socket) => {
  console.log("User connected", `${socket.id}`);

  socket.on("send_message", (data) => {
    handleIncomingMessage(data);
    io.emit("user-chat", data);
  });
});

server.listen(port, () => {
  console.log("Server is running in port +", port);
});
