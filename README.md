# Task Manager
## Overview
This project is a sample task manager application that demonstrates how to use MongoDB, Node.js, and WebSockets to build a real-time task manager. The application allows users to create, view, and delete tasks in real-time. It also conveniently shows the weather in Provo, Utah for the day.

### Features
1. User authentication: Users can sign up and log in to the application using their email address and password.
2. Task creation: Users can create new tasks with a title, description, and due date.
3. Task deletion: Users can delete their tasks.
4. Real-time updates: The application uses WebSockets to provide real-time updates to the user interface.
5. Weather: The application displays the current forecast for Provo, Utah

### Basic site information
Secure shell (SSH) is how I'll access my website. It will require a PEM key and an address, like this:
> ssh -i %PATH_TO_PEM_KEY% ubuntu@%IP_ADDRESS%

The ./deployFiles script will be used to push to production. I have added the command to a script of my own called pushLive, so I don't have to constantly type in all of the information.

#### Coding in Linux
Use VIM to edit code. VIM has a lot of hotkeys:
`^O` to insert line above
`o` to insert line below
`i` to enter insert mode
`ESC` to leave insert mode
`dd` to delete line
`yy` to copy line
`^P` to paste line

To see which node tasks are running, use `ps -aux | grep node`.

### Basic application design
`|Browser| <-----> |Node| <-----> |Database|`
Use GET, POST, DELETE, and PUT requests to navigate this flowchart.

#### User security
Use the following pattern to ensure users can't access other people's data:
```
  console.log('userID: ' + req.session.userId);
  if (req.session.userId) {
    validUser = await User.findOne({_id:req.session.userId});
    res.send('Logged in as user ' + validUser.username);
  } else { res.send('Not logged in'); }
```
Add this to: login, task creation, and updating the task page.

### HTML/CSS/JS
HTML provides the basic organisation for the website. It uses tags to separate different types of information.

CSS makes the HTML pretty, and gives things color, borders, and a more professional look.

JS provides the actual functionality for the buttons/links/forms/etc.

### NPM
NPM is the world's largest software repository. It contains most of the packages for this webapp. Through linux, it is easy to access:
> npm install %package_to_install%

Make sure the latest versions are installed! If they are out of date, code won't be compiled and run properly. This was a huge source of bugs at the beginning.
```
npm uninstall npm -g
rm -rf node_modules
npm install -g npm@latest
```

### Technologies Used
1. MongoDB: A NoSQL document database used to store task data.
2. Node.js: A server-side JavaScript runtime used to build the application server.
3. Express.js: A web application framework used to build the application server.
4. Socket.IO: A JavaScript library used to implement WebSockets.
5. HTML/CSS/JavaScript: Used to build the client-side user interface.
6. Browser Development tools: Browser toolset that can test instance settings, HTML, etc.

### Rubric
- Convert your start up application into a web service.
- Provide endpoints for your service.
- Call third party endpoints from your service. This can be as simple as displaying a quote like Simon does.
- Persist data in MongoDB. Data is updated and displayed by manipulating the DOM.
- Authenticate and create users. Login data is stored in MongoDB.
- Use WebSockets to receive data from your service and render it in the DOM.
- Make sure all authors of the code are attributed in the application and that there is a link to your GitHub repository.
- Periodically commit and push your code to GitHub.
- Periodically update your start up repository's README.md file to reflect what you have learned and want to remember.
- Push your final version of your project to GitHub.
- Deploy your start up application to your production environment (your server).
- Make sure your application is available from your production environment.
- Upload the URL to your start up application to the Canvas assignment.

### Takaways from the project
Be organised from the start. Halfway through this project, I realized I had code in a few different directories on my machine, which meant that GitHub didn't have the latest versions of code. This also meant that my README.md notes were spread accross multiple files. Keep things simple from the start and plan out project organization from the get go.

Simplicity in design is key. This project consolidated the original plan to just one main menu page, instead of redirecting all over the place, unifying code and using fewer files.

### React
npm install react - in project directory
npm install -g create-react-app

in react each function controls a part of a screen

JS componenets need to start w/ a capital letter

React blends html and js

html can only be returned in a single tag, but it can be a dummy tag and hold
a bunch of others

The direction matters - parents can pass info to child elements/components, but child components can't pass
data back to parents. To have children notify parents, pass a callback in from the parent that the child
can invoke

react rendering happens dynamically in the client

npm run build - this will run Babel so other systems can read my code, and will help me get the client js

