const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Function to generate a random 6-character string
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function getUserByEmail(email) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    };
  };

  return null;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// POST route to create a new short URL and save it to the database
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Get the long URL from the form data
  const shortURL = generateRandomString(); // Generate a random short URL

  // Save the long URL and short URL ID to the urlDatabase
  urlDatabase[shortURL] = longURL;

  // Redirect the user to created short URL page
  res.redirect(`/urls/${shortURL}`);
});

// GET route for the homepage
app.get("/", (req,res) => {
  res.send("Hello!");
});

// GET route to view the JSON representation of the URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// A simple route to demonstrate a hello world
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Display the list of all URLs
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]; // Retrieve user_id from cookies
  const user = users[userID]; // Find the user object based on user_id

  const templateVars = {
    user: user, // Pass the entire user object
    urls: urlDatabase, // Add the URL database
  };
  res.render("urls_index", templateVars); // Render urls_index.ejs and pass templateVars
});

// Route to render the form for creating a new URL, passing the username from cookies
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"]; // Retrieve user_id from cookies
  const user = users[userID]; // Find the user object based on user_id

  const templateVars = {
    user: user, // Pass the entire user object
  };
  res.render("urls_new", templateVars); // Pass user object to urls_new.ejs
});

// Render the "urls_new" template to display the form for creating a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Render the "urls_show" template to display details for a specific URL based on the ":id" parameter
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Redirect route for short URLs to long URLs
app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL); // Redirect to the corresponding long URL
});

// Render the "register" form when the "/register" route is accessed
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID]

  const templateVars = {
    user: user,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID]

  const templateVars = {
    user: user,
  };
  res.render("login", templateVars);
});

// POST route to handle updating the long URL for a given short URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls")
})

// POST route to handle deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// POST route to handle user login and set the user_id cookies
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const existingUser = getUserByEmail(email);

  if(!existingUser) {
    return res.status(403).send("This email is not registered.")
  };

  if(existingUser.password !== password) {
    return res.status(403).send("The password you entered is incorrect.")
  };

  res.cookie('user_id', existingUser.id);
  res.redirect("/urls");
});

// POST route to handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body; // Get email and password from the form data

  if(!email || !password) {
    return res.status(400).send("Must enter email and/or password.")
  };

  const existingUser = getUserByEmail(email)

  if(existingUser) {
    return res.status(400).send("This email entered has already been used.")
  };

  const userID = generateRandomString(); // Generate random unique user ID

   // Adding new user object to users object
  users[userID] = {
    id: userID,
    email: email,
    password: password,
  };

  console.log("Users object:", users);

  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// POST route to handle suer log out and clear the cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});