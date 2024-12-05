// Function to get a user by email address
const getUserByEmail = function(email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];  // Return just the user ID
    }
  }
  return; // Return undefined if no user with the given email is found
}

module.exports = { getUserByEmail }