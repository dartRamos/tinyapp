const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "[email protected]",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "[email protected]",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("[email protected]", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(user, testUsers[expectedUserID], "User ID should be userRandomID");
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("[email protecte]", testUsers);
    // Write your assert statement here
    assert.isUndefined(user, "User should be undefined for non-existent email");
  });
});

describe('urlsForUser', function() {
  
  // Test case 1: urlsForUser returns URLs that belong to the specified user
  it('should return only the URLs belonging to the specified user', function() {
    const urlDatabase = {
      'b6UTxQ': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' }, // Changed userId to userID
      'i3BoGp': { longURL: 'http://www.google.com', userID: 'user2' }, // Changed userId to userID
      '9xJkcH': { longURL: 'http://www.example.com', userID: 'user1' } // Changed userId to userID
    };

    const result = urlsForUser('user1', urlDatabase);
    const expected = {
      'b6UTxQ': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' }, // Changed userId to userID
      '9xJkcH': { longURL: 'http://www.example.com', userID: 'user1' } // Changed userId to userID
    };

    assert.deepEqual(result, expected);
  });

  // Test case 2: urlsForUser returns an empty object if no URLs belong to the specified user
  it('should return an empty object if no URLs belong to the specified user', function() {
    const urlDatabase = {
      'b6UTxQ': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' }, // Changed userId to userID
      'i3BoGp': { longURL: 'http://www.google.com', userID: 'user2' }, // Changed userId to userID
      '9xJkcH': { longURL: 'http://www.example.com', userID: 'user1' } // Changed userId to userID
    };

    const result = urlsForUser('user3', urlDatabase); // No URLs for 'user3'
    const expected = {}; // Expecting an empty object
    assert.deepEqual(result, expected);
  });

  // Test case 3: urlsForUser returns an empty object if the urlDatabase is empty
  it('should return an empty object if the urlDatabase is empty', function() {
    const urlDatabase = {}; // Empty urlDatabase
    const result = urlsForUser('user1', urlDatabase); // No URLs in the database
    const expected = {}; // Expecting an empty object
    assert.deepEqual(result, expected);
  });

  // Test case 4: urlsForUser does not return any URLs that do not belong to the specified user
  it('should not return any URLs that do not belong to the specified user', function() {
    const urlDatabase = {
      'b6UTxQ': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' }, // Changed userId to userID
      'i3BoGp': { longURL: 'http://www.google.com', userID: 'user2' }, // Changed userId to userID
      '9xJkcH': { longURL: 'http://www.example.com', userID: 'user1' } // Changed userId to userID
    };

    const result = urlsForUser('user2', urlDatabase); // Only 'user2' should be returned
    const expected = {
      'i3BoGp': { longURL: 'http://www.google.com', userID: 'user2' } // Changed userId to userID
    };

    assert.deepEqual(result, expected); // Should not return URLs that don't belong to 'user2'
  });

});