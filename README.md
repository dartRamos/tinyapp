# 🌟 **TinyApp Project** ✨  

Welcome to **TinyApp** - a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).


---

## **🖼️ Final Product**  

📸 Behold the website:  
### Home Page

### Home Page

![Home Page](./assets/Home%20Page.PNG)  
This is the **Home Page** of TinyApp, where users can see their shortened URLs and navigate to other sections.

### Create Page

![Create URL Page](./assets/Create%20Page.PNG)  
On the **Create Page**, users can enter long URLs to shorten them.

### Created Page

![URL Created Page](./assets/Created%20Page.PNG)  
Once the URL is shortened, the **Created Page** displays the new shortened link ready for use. 

---

## **🔮 Dependencies**  

Here’s what powers TinyApp under the hood:  

- 🟢 **Node.js** 
- ⚡ **Express**
- 🎨 **EJS**  
- 🔒 **bcryptjs**
- 🍪 **cookie-session**

---

## **🛠️ Getting Started**  

Ready to embark on your TinyApp journey? 🚀 Follow these enchanted steps:  

1. **Install all dependencies** 🛠️ using the following command:  
   - Install all dependencies (using the `npm install` command).
   - Run the development web server using the `node express_server.js` command.

---

## **📁 File Structure & Description**  

### Server Folder  

- **express_server.js**:  
  This file handles routing for the `/urls` endpoint and manages user actions like registration, login, and logout. It also includes all required project dependencies and sets EJS as the view engine for rendering pages.

- **helper.js**:  
  Contains various utility functions used throughout the project.  
  Some key functions are:  
  - `generateRandomString()`: Generates a random 6-character alphanumeric string to create unique short URLs and user IDs. 
  - `getUserByEmail(email, users)`: Verifies if an email is present in the user database and retrieves the associated user ID.  
  - `urlsForUser(id, urlDatabase)`: Returns a list of objects containing the long and short URLs associated with a specific user.

### Views Folder  

- **_header.ejs**: Template for the site's header.  
- **urls_index.ejs**: Displays a list of URLs in an organized manner.  
- **urls_show.ejs**: Allows users to update an existing URL.  
- **urls_new.ejs**: Provides the form to create a new shortened URL.  
- **register.ejs**: Form for user registration.  
- **login.ejs**: Form for user login.  

### Test Folder  

- **helpersTest.js**: Contains unit tests written for the helper functions using Test-Driven Development (TDD).

---

## **💡 Development Dependencies**  

In addition to the main dependencies, TinyApp uses these tools for development and testing:

- **Mocha**  
- **Chai**  
- **Nodemon**

---