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
}

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
  const templateVars = {
    username: req.cookies["username"], // Retrieve username from cookies
    urls: urlDatabase, // Add the URL database
  };
  res.render("urls_index", templateVars); // Render urls_index.ejs and pass templateVars
});

// Route to render the form for creating a new URL, passing the username from cookies (if available)
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // Get username from cookie
  };
  res.render("urls_new", templateVars); // Pass username to urls_new.ejs
});

// Render the form to create a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Show the details for a specific URL (short URL)
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Redirect route for short URLs to long URLs
app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL); // Redirect to the corresponding long URL
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

app.post("/login", (req, res) => {
  const { username } = req.body;

  res.cookie('username', username);
  res.redirect("/urls");
})

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});