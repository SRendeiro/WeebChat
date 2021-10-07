const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const crypto = require("crypto");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const sqlite = require("sqlite3").verbose();
const dbJS = require("./db.js");

dbJS.openDB();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.post("/", function (req, res) {
  let user_token = req.cookies["userKey"]; // always empty
  crypto.randomBytes(24, function (err, buffer) {
    var id = crypto.randomBytes(20).toString("hex");
    dbJS.addUser(req.body.user.username, req.body.user.pwd, id);
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.cookie("userKey", id, {
      maxAge: 9000000000,
      httpOnly: true,
      secure: true,
    });
    res.append("Set-Cookie", "userKey=" + id + ";");
    res.redirect("/chat");
  });
});

app.get("/", (req, res) => {
  let user_token = req.cookies["userKey"];
  if (user_token) {
    res.redirect("/chat");
  } else {
    res.sendFile(__dirname + "/signup.html");
  }
});

app.get("/chat", (req, res) => {
  let user_token = req.cookies["userKey"]; // always empty
  if (user_token) {
    res.sendFile(__dirname + "/index.html");
  } else {
    res.redirect("/");
  }
});

io.on("connection", (socket) => {
  let cookies = socket.request.headers.cookie;
  console.log(cookies);
  /* let usernameFound = dbJS.searchUser(); */
  io.emit("chat message", "User connected");

  socket.on("disconnect", () => {
    io.emit("chat message", "User disconnected");
  });

  socket.on("chat message", (msg) => {
    /* let user_token = req.cookies["userKey"];
    console.log(user_token); */
    sqlite.io.emit("chat message", msg);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

/*
var tools = require('./tools');
console.log(typeof tools.foo); // => 'function'
console.log(typeof tools.bar); // => 'function'
console.log(typeof tools.zemba); // => undefined*/
