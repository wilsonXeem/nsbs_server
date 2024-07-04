// Models
const Vote = require("../models/votes");
const Contestant = require("../models/contestant");

module.exports.registerVote = async (req, res, next) => {
  const value = req.body.value;

  try {
    const vote = new Vote({
      code: `${Math.floor(100000 + Math.random() * 900000)}`,
      type: value,
    });

    const voted = await vote.save();

    res
      .status(200)
      .json({ message: "vote registered!", type: "vote", voted: voted });
  } catch (err) {
    console.log(err, next);
  }
};

module.exports.voterLogin = async (req, res, next) => {
  const code = req.body.code;

  try {
    const vote = await Vote.findOne({ code });

    if (!vote) {
      res.status(400).json({
        message: "Invalid Vote",
        type: "vote",
      });
    }

    res.status(200).json({ message: "Valid Vote", type: "vote", vote });
  } catch (err) {
    console.log(err);
  }
};

module.exports.registerContestant = async (req, res, next) => {
  const fullname = req.body.fullname;

  try {
    const cont = new Contestant({
      fullName: fullname,
    });

    const contestant = await cont.save();

    res.status(200).json({
      message: "Contestant registered!",
      type: "contestant",
      voted: contestant,
    });
  } catch (err) {
    console.log(err, next);
  }
};

module.exports.voteContestant = async (req, res, next) => {
  const value = req.body.value;
  const fullName = req.body.fullname;
  try {
    const contestant = await Contestant.findOne({ fullName });

    if (!contestant) {
      res
        .status(400)
        .json({ message: "Contestant not Found!", type: "contestant" });
    }

    contestant.votes += value;

    await contestant.save();

    res.status(200).json({ message: "Voting Successful!", type: "vote" });
  } catch (error) {
    console.log(error, next);
  }
};

module.exports.getContestant = async (req, res, next) => {
  try {
    const contestants = await Contestant.find()
      .exec()
      .then((users) => {
        const response = users.map((user) => {
          return { fullname: user.fullName, votes: user.votes };
        });
        io.emit("me", response);
      });

    res
      .status(200)
      .json({ message: "Voting Successful!", type: "vote", contestants });
  } catch (error) {
    console.log(error, next);
  }
};
