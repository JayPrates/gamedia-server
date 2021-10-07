// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");


// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const session = require("express-session");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

app.set("trust propxy", 1); //Security requirements from Heroku
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      /* sameSite: true */
      sameSite: "none", //both fe and be are running on the same hostname
      httpOnly: false, //we are not using https
      maxAge: 600000, //session time
      secure:true
    },
    rolling: true,
  })
);


function getCurrentLoggedUser(req, res, next) {
	if (req.session && req.session.currentUser) {
		app.locals.loggedInUser = req.session.currentUser.username; //local variable from express
	} else { 
		app.locals.loggedInUser = "";
  
	}
	next(); //so we can leave the middleware
  }
  
  app.use(getCurrentLoggedUser);

// default value for title local
const projectName = "game-app-server";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const project = require('./routes/project-routes')
app.use('/', project);

const auth = require('./routes/auth-routes');
const { none } = require("./config/cloudinary");
app.use('/', auth);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
