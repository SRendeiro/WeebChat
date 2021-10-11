/* --------------------------------------------------
Author: Samuel Pinto Rendeiro
Created: 01.10.2021 
Version: 0.1
---------------------------------------------------*/

//Dependecies required for the Chat
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
const cookieModule = require("cookie");
//External JS file for database queries
const dbJS = require("./db.js");

//* Required here, this will check if DB exist, or create it if necessary
dbJS.createDB();

// ! Either absolutely useless, or might break everything if removed
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

//Will be called on user signup
app.post("/", function (req, res) {
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
    //After creating the cookie, will redirect to the main chat
    res.redirect("/chat");
  });
});

//Main page, will either redirect to signup or chat depeding on cookie existing
app.get("/", (req, res) => {
  let user_token = req.cookies["userKey"];
  if (user_token) {
    res.redirect("/chat");
  } else {
    res.sendFile(__dirname + "/signup.html");
  }
});

//Chat page, will check cookie and redirect if necessary to signup
app.get("/chat", (req, res) => {
  let user_token = req.cookies["userKey"]; // always empty
  if (user_token) {
    res.sendFile(__dirname + "/index.html");
  } else {
    res.redirect("/");
  }
});

//Using socket.io, handling user interaction is fairly easy.
io.on("connection", (socket) => {
  let cookies = cookieModule.parse(socket.request.headers.cookie); //* cookie usage is a little different but logic stays the same
  dbJS.searchUser(cookies.userKey, function (response) {
    io.emit("chat message", response.username + " connected");
  });
  socket.on("disconnect", () => {
    dbJS.searchUser(cookies.userKey, function (response) {
      io.emit("chat message", response.username + " disconnected");
    });
  });

  socket.on("chat message", (msg) => {
    dbJS.searchUser(cookies.userKey, function (response) {
      io.emit("chat message", response.username +": "+msg);
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
