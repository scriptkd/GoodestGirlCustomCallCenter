const express = require("express");
const twilio = require("./Twilio");
const cors = require("cors");
const app = express();
const { getTokenForVoice } = require("./Twilio");

const PORT = 3001;

const http = require("http");
const socketIo = require("socket.io");
const jwt = require("./utils/jwt");

const server = http.createServer(app);
const socket = socketIo(server);

socket.use((socket, next) => {
  console.log("Socket Middleware Working...");
  if (socket.handshake.query && socket.handshake.query.token) {
    const { token } = socket.handshake.query;
    try {
      const result = jwt.verifyToken(token);
      console.log("Token Accepted!");
      if (result.username) return next();
    } catch (error) {
      console.log(error);
    }
  }
});

socket.on("connection", (socket) => {
  console.log("Socket Connected at", socket.id);
  socket.emit("twilio-token", { token: getTokenForVoice("sashaline") });
  socket.on("disconnect", () => {
    console.log("Socket Disconnected at", socket.id);
  });
  socket.on("answer-call", ({ sid }) => {
    console.log("Setting Call:", sid);
    twilio.answerCall(sid);
  });
  socket.on("end-call", ({ sid }) => {
    console.log("Ending Call:", sid);
    twilio.endCall(sid);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/test", (req, res) => {
  res.send("Hey it's twilio");
});

app.post("/login", async (req, res) => {
  console.log("Youre logging in");
  const { to, username, channel } = req.body;
  await twilio.sendVerify(to, channel);
  res.send("Code Sent!");
});

app.post("/verify", async (req, res) => {
  const { to, code, username } = req.body;
  const data = await twilio.verifyCode(to, code);
  if (data.status === "approved") {
    const token = jwt.createJwt(username);
    return res.send({ token });
  }
  res.status(401).send("Invalid Token");
});

app.post("/call-status-change", (req, res) => {
  console.log("Call status changed");
  res.send("ok");
});

app.post("/call-new", (req, res) => {
  console.log("New call incoming");
  socket.emit("call-new", {
    data: req.body,
  });
  const greeting = twilio.voiceResponse(
    "Thank you for calling Sasha's Hotline! Please hold while we consult the elder gods! we are dedicated to bringing you the best service possible. Please take a moment to reflect on how good the goodest girl really is, and we'll have an agent on the line with you shortly! One does not simply pet Sasha just once! She demands more pets everyday. All day. Can't stop. won't stop. Wutang Clan forever."
  );
  res.type("text/xml");
  res.send(greeting.toString());
});

app.post("/enq", (req, res) => {
  console.log("Call currently in queue...");
  socket.emit("enq", { data: req.body });
  const response = twilio.enqueueCall("Sasha Treat Line");
  res.type("text/xml");
  res.send(response.toString());
});

app.post("/connect-call", (req, res) => {
  console.log("Picking Up!");
  socket.emit("answer-call", { data: req.body });
  const response = twilio.redirectCall("sashaline");
  res.type("text/xml");
  res.send(response.toString());
});

app.post("/end-call", (req, res) => {
  console.log("Ending Call!");
  socket.emit("end-call", { data: req.body });
  const response = twilio.endCall("sashaline");
  res.type("text/xml");
  res.send(response.toString());
});

app.post("/validate-token", (req, res) => {
  console.log("Validating Token...");
  const { token } = req.body;
  let isValid = false;
  try {
    isValid = jwt.verifyToken(token);
  } catch (error) {
    console.log(error);
  }
  res.send({ isValid });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
