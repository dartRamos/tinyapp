const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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
    const user = getUserByEmail("[email protected]", testUsers)
    const expectedUserID = "userRandomID"
    // Write your assert statement here
    assert.deepEqual(user, testUsers[expectedUserID], "User ID should be userRandomID");
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("[email protecte]", testUsers);
    // Write your assert statement here
    assert.isUndefined(user);
  });
});