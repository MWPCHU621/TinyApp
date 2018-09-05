var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "Juunis": {
    id: "Juunis",
    email: "deathxkeeper@hotmail.com",
    password: "helloworld"
  }
}

//<-----------------ALL GET ENDPOINTS------------------>

//root html site
app.get("/", (req, res) => {
  res.send("Hello!");
});

//renders urls_index.ejs file
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users,
    urls: urlDatabase,
  };
  console.log(req.cookies.user_id);
  if(req.cookies.user_id)
  {
    templateVars["cookies"] = req.cookies.user_id;
    templateVars["loggedIn"] = true;
    res.render("urls_index", templateVars);
  }
  else {
    return res.redirect("/login");
  }
});

//renders urls_new.ejs template html
app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: users,
    urls: urlDatabase
  };
  if(req.cookies.user_id)
  {
    templateVars["cookies"] = req.cookies.user_id;
    templateVars["loggedIn"] = true;
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login");
  }
});

//renders the login page.
app.get("/register", (req, res) => {
  let templateVars = {
    users: users,
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    users: users,
    urls: urlDatabase
  }
  res.render("urls_login", templateVars);
});

//redirects to the actual longURL webpage
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//html of a selected shortform
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users
  };
  if(req.cookies.user_id)
  {
    templateVars["cookies"] = req.cookies.user_id;
    templateVars["loggedIn"] = true;
    res.render("urls_show", templateVars);
  }
  else {
    res.redirect("/login");
  }


});


//<----------------ALLL POST ENDPOINTS----------------->



//creates new entry in urlDatabase
app.post("/urls", (req, res) => {
  let shortkey = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortkey] = longURL;
  //console.log(urlDatabase);  // debug statement to see POST parameters
  res.redirect("http://localhost:8080/urls/" + shortkey);         // Respond with 'Ok' (we will replace this)
});

//adds a new user object to global database.
//holds user's email, password, and userId.
app.post("/register", (req, res) => {
  let userEmails = Object.values(users).map(users => users.email);
  //if either user_id or password section is empty
  if(req.body.email === "" || req.body.password === "") {
    return res.status(400).json({
      error: "Invalid user_id or password"
    });
  }
  //if user_id already exists
  else if(userEmails.includes(req.body.email)) {
    return res.status(400).json({
      error: "Email already exists"
    });
  } else {
    let userId = generateRandomString();
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", userId);

    res.redirect("/login");
    //console.log(users);
  };
});

//creates login Form and set cookie with
//users database. If email
app.post("/login", (req, res) => {
  //let userId = Object.values(users).map(users => users.id);
  let userEmail = Object.values(users).map(users => users.email);
  let statusCode = 200;
  //console.log(userEmail, req.body.email);
  if(!userEmail.includes(req.body.email)) {
    res.status(403).json({
      error: "Cannot find email"
    });
  }
  else {
    let userId = getId(req.body.email);
    //console.log(users[userId]);
    if(users[userId]["password"] !== req.body.password) {
      res.status(403).json({
        error: "PASSWORD DOES NOT MATCH"
      });
    }
    else {
      res.cookie("user_id", users[user]["id"]);
      res.redirect("/urls");
    }
  }
});

//helper function for finding userId given an email address
//helper function for post(/"login") endpoint.
function getId(email) {
  for(user in users) {
    if(users[user]["email"] === email)
      return users[user]["id"];
  }
}

//logs the user out and clears cookie while redirecting to login page
app.post("/logout", (req, res) => {
  //console.log(req.cookie(user_id));
  res.clearCookie("user_id");
  res.redirect("/login");
});


//deletes both shortURL and longURL from urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  let idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  //console.log(urlDatabase);
  res.redirect("/urls");
});


//updates longURL
app.post("/urls/:id", (req, res) => {
  let update = req.body.longURL;
  let key = req.params.id;
  urlDatabase[key] = update;
  res.redirect("/urls")
});




//test html page to how hello world.
app.get("/hello", (req, res) => {
  res.send(
    "<html> <body>Hello <b>World</b></body></html>\n");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//generates a random alphaNumeric string of length 6.
function generateRandomString() {
  let alphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for(let i = 0; i < 6; i++) {
    result += alphaNumeric.charAt(Math.floor(Math.random()*alphaNumeric.length));
  }
  return result;
}












