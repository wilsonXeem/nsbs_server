const express = require("express");
const router = express.Router();
// Controllers
const authControllers = require("../controllers/auth");

router.post("/register", authControllers.registerVote);
router.post("/login", authControllers.voterLogin);
router.post("/cont", authControllers.registerContestant)
// router.post("/vote", authControllers.voteContestant)

module.exports = router;
