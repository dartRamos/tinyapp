//  -------------------- PORT -------------------- //

const PORT = 8080; // Define the port where the server will listen

// -------------------- DEPENDENCIES -------------------- //

const express = require("express"); // Import the Express library
const cookieSession = require("cookie-session"); // Import the cookie parser middleware
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");
const app = express(); // Initialize the Express application

// -------------------- MIDDLEWARE -------------------- //

// Set the view engine to EJS for rendering views
app.set("view engine", "ejs");
// Middleware to parse URL-encoded data (from forms)
app.use(express.urlencoded({ extended: true }));
// Middleware to manage and store session data in cookies (automatically signed and encrypted)
app.use(cookieSession({
  name: 'session',  // The name of the session cookie
  keys: ['key1', 'key2'] // Secret keys used to sign the session cookie
}));

// -------------------- DATA -------------------- //

// Mock data for the URL database, each URL has a short URL, long URL, and associated user ID
const urlDatabase = {
  b6U1: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Mock data for users, each user has an ID, email, and password
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

// -------------------- GET ROUTE HANDLERS -------------------- //

// GET route for the homepage
app.get("/", (req,res) => {
  res.redirect("/login");
});

// GET route to view the URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// Display the list of URLs for the logged-in user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id; // Retrieve user_id from cookies
  const user = users[userID]; // Find the user object based on user_id

  if (!userID) {
    return res.send("You must be logged in to see your URL.");
  }

  const userURLs = urlsForUser(userID, urlDatabase); // Get all URLs associated with the logged-in user

  const templateVars = {
    user: user, // Pass the user object
    urls: userURLs, // Pass the URLs that belong to the logged-in user
  };

  res.render("urls_index", templateVars); // Render urls_index.ejs and pass templateVars
});

// Route to render the form for creating a new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id; // Retrieve user_id from cookies
  const user = users[userID]; // Find the user object based on user_id

  // If user is not logged in, redirect to login page
  if (!user) {
    return res.redirect("/login");
  }

  const userURLs = urlsForUser(userID, urlDatabase);

  const templateVars = {
    user: user, // Pass the entire user object
    urls: userURLs, // Pass the URLs associated with the logged-in user
  };
  res.render("urls_new", templateVars); // Pass user object to urls_new.ejs
});

// Render the "urls_show" template to show details of a specific URL based on its ID
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]; // Get the user from the session
  const shortURL = req.params.id; // Get the short URL from the URL parameter
  const urlEntry = urlDatabase[shortURL]; // Find the URL entry in the database
  
  // If URL doesn't exist or doesn't belong to the current user
  if (!urlEntry) {
    return res.status(404).send("URL not found!");
  }

  if (urlEntry.userID !== userID) {
    return res.status(403).send("You can only view and edit your own URLs.");
  }

  const longURL = urlEntry.longURL; // Get the long URL

  const templateVars = {
    user: user,
    id: shortURL, // Pass the URL's short ID
    longURL: longURL, // Pass the long URL associated with the short URL
  };
  res.render("urls_show", templateVars); // Render the template with the data
});

// Redirect to the long URL for a short URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Get the short URL from the URL parameter
  const urlEntry = urlDatabase[shortURL]; // Get the URL data from the database
  
  // If URL doesn't exist, return 404 error
  if (!urlEntry) {
    return res.status(404).send("URL not found!");
  }

  const longURL = urlEntry.longURL; // Get the long URL associated with the short URL
  res.redirect(longURL); // Redirect to the corresponding long URL
});

// Render the registration form if the user is not logged in
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: user,
  };
  res.render("register", templateVars);
});

// Render the login form if the user is not logged in
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: user,
  };
  res.render("login", templateVars);
});

// -------------------- POST ROUTE HANDLERS -------------------- //

// POST route to create a new short URL for the long URL submitted by the user
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  
  if (!user) {
    return res.redirect("/login");
  }

  const longURL = req.body.longURL; // Get the long URL from the form data
  const shortURL = generateRandomString(); // Generate a random short URL

  // Save the long URL and short URL ID to the urlDatabase
  urlDatabase[shortURL] = { longURL: longURL, userID: userID };

  // Redirect the user to created short URL page
  res.redirect(`/urls/${shortURL}`);
});

// POST route to update the long URL for a given short URL
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  if (!userID) {
    return res.status(403).send("You must be logged in!");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found!");
  }

  const urlEntry = urlDatabase[shortURL];

  if (userID !== urlEntry.userID) {
    return res.status(403).send("You are not the creator of this URL!");
  }

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls`);
});

// POST route to handle deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  if (!userID) {
    return res.status(403).send("You must be logged in to delete this URL!");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found!");
  }

  const urlEntry = urlDatabase[shortURL];

  if (userID !== urlEntry.userID) {
    return res.status(403).send("You cannot delete URLs that you did not create!");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// POST route to handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body; // Get email and password from the form data

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters long.");
  }

  const user = getUserByEmail(email, users);
  
  if (user) {
    return res.status(400).send("This email entered has already been used.");
  }

  const userID = generateRandomString(); // Generate random unique user ID

  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Adding new user object to users object
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = userID;
  res.redirect("/urls");
});

// POST route to handle user login and set the user_id cookies
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users); // Get the whole user object

  if (!email || !password) {
    return res.status(400).send("Both email and password are required.");
  }

  if (!user) {
    return res.status(403).send("This email is not registered.");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("The password you entered is incorrect.");
  }

  req.session.user_id = user.id; // Set user.id in the session after successful login
  res.redirect("/urls");
});

// POST route to handle suer log out and clear the cookies
app.post("/logout", (req, res) => {
  req.session = null; // Only clear the user_id from the session
  res.redirect("/login");
});

// -------------------- PORT LISTENER -------------------- //

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});