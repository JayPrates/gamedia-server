const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");


router.post("/signup", async (req, res) => {
  const { username, password, userImg } = req.body;
  //   const username = req.body.username;
  //   const password = req.body.password;
  if (username === "" || password === "" ) {
    res.render("auth/signup", { errorMessage: "Fill username and password" });
    return;
  }

  if ( userImg === "" ) {
    res.render("auth/signup", {errorMessage: "Please upload a profile picture"});
  }

  const user = await User.findOne({ username });
  if (user !== null) {
    //found the user, it already exists
    res.status(401).json({message: "user already exists"});
    return;
  }

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newUser = await User.create({
    username,
    password: hashedPassword,
    userImg,
  });
  res.status(200).json(newUser);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.render("auth/login", { errorMessage: "Fill username and password" });
    return;
  }
  const user = await User.findOne({ username });
  if (user === null) {
    res.render("auth/login", { errorMessage: "Invalid login" });
    return;
  }

  if (bcrypt.compareSync(password, user.password)) {
    //passwords match - login successful
    req.session.currentUser = user;
    res.status(200).json(user);
  } else {
    res.status(401).json({message: "invalid login"});
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({message: "User logged out"});
});

router.get("/isLoggedIn", (req, res) => {
    if(req.session.currentUser) {
        res.status(200).json(req.session.currentUser);
    } else {
        res.status(200).json({});
    }
})

module.exports = router;