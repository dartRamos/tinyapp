// Function to get a user by email address
const getUserByEmail = function(email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];  // Return just the user ID
    }
  }
  return; // Return undefined if no user with the given email is found
};

// Function to get all URLs associated with a specific user ID
const urlsForUser = function(id, urlDatabase) {
  const userURLs = {};

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL]; // Store the full URL object
    }
  }

  return userURLs;  // Return the object containing the user's URLs
};

// Function to generate a random 6-character string
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };