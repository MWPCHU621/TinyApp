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

//root html site
app.get("/", (req, res) => {
  res.send("Hello!");
});

//html page with all the urls
app.get("/urls", (req, res) => {
  let templateVars = {
    username:req.cookies["username"],
    urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//renders urls_new.ejs template html
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//creates new entry in urlDatabase
app.post("/urls", (req, res) => {
  let shortkey = generateRandomString();
  urlDatabase[shortkey] = req.body.longURL;
  //console.log(urlDatabase);  // debug statement to see POST parameters
  res.redirect("http://localhost:8080/urls/" + shortkey);         // Respond with 'Ok' (we will replace this)
});

//deletes both shortURL and longURL from urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  let idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  //console.log(urlDatabase);
  res.redirect("/urls");
});

//creates login Form and set cookie with
//username = submitted data.
app.post("/login", (req, res) => {
  //console.log(req.body.name);
  res.cookie("username",req.body.name);
  res.redirect("/urls");
});

//creates logout form and displays username.
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//updates longURL
app.post("/urls/:id", (req, res) => {
  let update = req.body.longURL;
  let key = req.params.id;
  urlDatabase[key] = update;
  res.redirect("/urls")
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
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);

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