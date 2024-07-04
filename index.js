const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const app = express();
const { Server } = require("socket.io");

app.use(
  cors({
    origin: "https://nsbs-2024.vercel.app/",
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://nsbs-2024.vercel.app/",
  },
});

const Contestant = require("./models/contestant");
const Votes = require("./models/votes");

mongoose
  .connect(
    "mongodb+srv://algorizim:algorizim@cluster0.s3hokhe.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((err) => console.log("mongoose not connected", err));

// Routes
const userRoutes = require("./routes/auth");

// Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, , X-Requested-With, Origin, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Endpoints
app.use("/vote", userRoutes);
app.get("/", (req, res, next) => {
  res.send("Hello world");
});

app.get("/contestants", async (req, res, next) => {
  let contestants;
  try {
    await Contestant.find()
      .exec()
      .then((users) => {
        contestants = users.map((user) => {
          return { fullname: user.fullName, votes: user.votes };
        });
        io.emit("me", contestants);
      });

    res.status(200).json({
      message: "contestants successfully fetched",
      type: "contestants",
      contestants,
    });
  } catch (error) {
    console.log(error, next);
  }
});

app.post("/vote/voting", async (req, res, next) => {
  const value = req.body.value;
  const fullName = req.body.fullname;
  const code = req.body.code;
  try {
    const contestant = await Contestant.findOne({ fullName });

    if (!contestant) {
      res
        .status(400)
        .json({ message: "Contestant not Found!", type: "contestant" });
    }

    contestant.votes += value;

    await contestant.save();

    await Contestant.find()
      .exec()
      .then((users) => {
        const contestants = users.map((user) => {
          return { fullname: user.fullName, votes: user.votes };
        });
        io.emit("me", contestants);
      });

    await Votes.deleteOne({ code });

    res.status(200).json({ message: "Voting Successful!", type: "vote" });
  } catch (error) {
    console.log(error, next);
  }
});

// const User = require("./models/votes");

app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.split("/").pop() === "favicon.ico") {
    return res.sendStatus(204);
  }
  return next();
});

io.on("connection", (socket) => {
  Contestant.find()
    .exec()
    .then((users) => {
      const response = users.map((user) => {
        return { fullname: user.fullName, votes: user.votes };
      });
      io.emit("me", response);
    });
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.statusCode,
    message = err.message,
    type = err.type || "";

  res.status(status).json({ message, status, type });
});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log("Server started: ", port));
