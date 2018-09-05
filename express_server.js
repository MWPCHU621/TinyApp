var express = require("express");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
var app = express();
app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "Juunis"
  }
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
  //created empty array to hold user's short/long URL only.
  let userURL = [];
  //loops through the database of objects
  for(let url in urlDatabase) {
    //compares to see whether the id for a specific URL is the same as the current cookie user.
    if(urlDatabase[url]["userID"] === req.cookies.user_id) {
      //creates a shallow copy of our database that will also have a shortURL key and value pair.
      let copyURL = Object.assign({shortURL: url}, urlDatabase[url]);
      //pushes shallow object into array.
      userURL.push(copyURL);
    }
  }
  let templateVars = {
    user: users,
    urls: userURL,
  };
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
  let longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//html of a selected shortform
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]["longURL"],
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
  let userID = req.cookies.user_id;
  urlDatabase[shortkey] = {
    longURL: longURL,
    userID: userID
  };
  res.redirect("http://localhost:8080/urls/");         // Respond with 'Ok' (we will replace this)
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
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword
    };
    console.log(users[userId]);
    res.cookie("user_id", userId);

    res.redirect("/login");
  };
});

//creates login Form and set cookie with
//users database. If email
app.post("/login", (req, res) => {
  //let userId = Object.values(users).map(users => users.id);
  let userEmail = Object.values(users).map(users => users.email);
  let statusCode = 200;
  if(!userEmail.includes(req.body.email)) {
    res.status(403).json({
      error: "Cannot find email"
    });
  }
  else {
    let userId = getId(req.body.email);
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
  res.clearCookie("user_id");
  res.redirect("/login");
});


//deletes both shortURL and longURL from urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  let idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});


//updates longURL
app.post("/urls/:id", (req, res) => {
  let update = req.body.longURL;
  let key = req.params.id;
  urlDatabase[key]["longURL"] = update;
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












