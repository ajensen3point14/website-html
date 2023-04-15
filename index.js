const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
//const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
//const WebSocket = require('ws');

const app = express();
const port = 4000;

/*
// Set up MongoDB connection
//mongoose.connect('mongodb://startup.aaronwebprogramming260.click', useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define schema and model for tasks
const taskSchema = new mongoose.Schema({
  description: String,
  completed: Boolean,
  username: String
});

const Task = mongoose.model('Task', taskSchema);

// Set up session middleware
app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
*/

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
// Set up WebSocket server
const wsServer = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server listening on port 8080');
*/



// Set up login route
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (username == 'aaron2' && password == 'test') {
    res.redirect('/MainMenu.html');
  } else { res.redirect('/login.html'); }

/*
  // Check if user exists
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    } else if (!user) {
      res.status(401).send('Invalid username or password');
    } else {
      // Compare passwords
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
        } else if (!result) {
          res.status(401).send('Invalid username or password');
        } else {
          // Save user ID in session
          req.session.userId = user._id;

          // Send success response
          res.send('Login successful');
        }
      });
    }
  });
*/
});

// Set up logout route
app.get('/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    } else {
      // Redirect to login page
      res.redirect('/');
    }
  });
});

// Set up task list route
app.get('/tasks', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Get tasks for current user
  Task.find({ username: req.session.username }, (err, tasks) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    } else {
      // Send tasks as JSON
      res.json(tasks);
    }
  });
});

// Set up add task route
app.post('/tasks', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Create new task
  const task = new Task
  ({
    description: req.body.description,
    completed: false,
    username: req.session.username
  });

  // Save task to database
  task.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    } else {
      // Send success response
      res.send('Task added');
    }
  });
});

// Set up update task route
app.put('/tasks/:id', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Get task ID from URL parameter
  const taskId = req.params.id;

  // Update task in database
  Task.findByIdAndUpdate(taskId, { completed: req.body.completed }, (err, task) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    } else if (!task) {
      res.status(404).send('Task not found');
    } else {
      // Send success response
      res.send('Task updated');
    }
  });
});

// Set up delete task route
app.delete('/tasks/:id', (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Get task ID from URL parameter
  const taskId = req.params.id;

  // Delete task from database
  Task.findByIdAndDelete(taskId, (err, task) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    } else if (!task) {
      res.status(404).send('Task not found');
    } else {
      // Send success response
      res.send('Task deleted');
    }
  });
});

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(port, () => {
  console.log(`Task manager app listening at http://localhost:${port}`);
});

