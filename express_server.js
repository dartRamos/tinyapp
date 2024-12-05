//  -------------------- PORT -------------------- //

const PORT = 8080; // Define the port where the server will listen

// -------------------- DEPENDENCIES -------------------- //

const express = require("express"); // Import the Express library
const cookieSession = require("cookie-session"); // Import the cookie parser middleware
const app = express(); // Initialize the Express application
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers")

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

// -------------------- Functions -------------------- //

// Function to generate a random 6-character string
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to get all URLs associated with a specific user ID
function urlsForUser(id) {
  const userURLs = {};

  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      userURLs[shortURL] = urlDatabase[shortURL]; // Store the full URL object
    }
  }

  return userURLs;  // Return the object containing the user's URLs
}

// -------------------- GET ROUTE HANDLERS -------------------- //

// GET route for the homepage
app.get("/", (req,res) => {
  res.send("Hello!");
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

  const userURLs = urlsForUser(userID); // Get all URLs associated with the logged-in user

  const templateVars = {
    user: user, // Pass the entire user object
    urls: userURLs, // Pass the URL database to the template
  };

  res.render("urls_index", templateVars); // Render urls_index.ejs and pass templateVars
});

// Route to render the form for creating a new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id; // Retrieve user_id from cookies
  const user = users[userID]; // Find the user object based on user_id

  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: user, // Pass the entire user object
  };
  res.render("urls_new", templateVars); // Pass user object to urls_new.ejs
});

// Render the "urls_show" template to show details of a specific URL based on its ID
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.id;
  
  const templateVars = {
    user: user,
    id: req.params.id, // Pass the URL's short ID
    longURL: urlDatabase[shortURL].longURL, // Pass the long URL associated with the short URL
  };
  res.render("urls_show", templateVars);
});

// Redirect to the long URL for a short URL
app.get("/u/:id", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.status(403).send("You must be logged in to view your URLs.");
  }

  const shortURL = req.params.id;
  const urlEntry = urlDatabase[shortURL]; // Get the URL data for the short URL

  if (!urlEntry) {
    return res.status(404).send("URL not found!");
  }

  if (userID !== urlEntry.userID) {
    return res.status(403).send("You can only view your own URLs.");
  }

  const longURL = urlEntry.longURL;
  res.redirect(longURL); // Redirect to the corresponding long URL
});

// Render the registration form if the user is not logged in
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (user) {
    return res.redirect("urls");
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
    return res.status(403).send("You need to be logged in to shorten URLs.");
  }

  const longURL = req.body.longURL; // Get the long URL from the form data
  const shortURL = generateRandomString(); // Generate a random short URL

  // Save the long URL and short URL ID to the urlDatabase
  urlDatabase[shortURL] = { longURL, userID };

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
  res.redirect(`/urls/${shortURL}`);
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

  if (!email || !password) {
    return res.status(400).send("Both email and password are required.");
  }

  const userID = getUserByEmail(email, users); // Get the whole user object

  if (!userID) {
    return res.status(403).send("This email is not registered.");
  }

  const user = users[userID];

  // Use bcrypt.compareSync to compare the provided password with the stored hashed password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("The password you entered is incorrect.");
  }

  req.session.user_id = userID;
  res.redirect("/urls");
});

// POST route to handle suer log out and clear the cookies
app.post("/logout", (req, res) => {
  req.session = null; // Clears the session and logs the user out
  res.redirect("/login");
});

// -------------------- PORT LISTENER -------------------- //

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});