const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const app = express();
const port = 4000;
const weather = require('weather-js');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ajensen3point14:V235yxe9!!YoDead@webprogramming.xzxdrcm.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define schema and model for tasks
const taskSchema = new mongoose.Schema({
  description: String,
  completed: Boolean,
  name: String,
  dueDate: String,
  username: String
});

const Task = mongoose.model('Task', taskSchema);

//Define schema and model for users
const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String
});

const User = mongoose.model('User', userSchema);

// Set up session middleware
app.use(session({
  secret: 'Correct-Horse.Battery;Staple!',
  resave: false,
  saveUninitialized: true,
  //store: new MongoStore({ mongooseConnection: mongoose.connection })
  store: MongoStore.create({client})
}));

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Set up WebSocket server
const wsServer = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server listening on port 8080');

app.get('/weather', (req, res) => {
  try {
    weather.find({search: 'Provo, UT', degreeType: 'F'}, (err, result) => {
      if (err) { 
        console.log(err); 
        res.status(500).send('Internal server error' + err);
      } else { res.json(result); }

    });
  } catch (err) { res.status(500).send('Internal server error' + err); } 
});

// Set up login route
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  var whichButton = "Login";
  if (req.body.Create) { whichButton = "Create"; }
  console.log(req.body);
  
  try {
    // Ensure username is valid
    if (password.length == 0 || username.length == 0) throw Error('Must provide a username and password');
    
    validUser = await User.findOne({ username: username });
    if (validUser == null && whichButton == "Login") throw Error('Invalid username');
    if (validUser != null && whichButton == "Create") throw Error('User already exists');
    if (validUser == null && whichButton == "Create") {
      const saltRounds = 10;
      h = await bcrypt.hash(password, saltRounds);
      validUser = User({username: username, passwordHash: h});
      await validUser.save();
    }
    console.log('Valid user: '+ validUser);

    // Verify correct password
    same = await bcrypt.compare(password, validUser.passwordHash);
    if (!same) { res.status(401).send('Invalid password'); }
    else {
      // Save user ID in session
      req.session.userId = validUser._id;
      req.session.username = validUser.username;

      // Send success response
      res.redirect('/MainMenu.html');
    }

  } catch (ex) { res.status(500).send('Internal server error: ' + ex); }
});

// Verify users are logged in/out
app.get('/info', async(req, res) => {
  console.log('userID: ' + req.session.userId);
  if (req.session.userId) {
    validUser = await User.findOne({_id:req.session.userId});
    res.send('Logged in as user ' + validUser.username);
  } else { res.send('Not logged in'); }
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
      res.redirect('/login.html');
    }
  });
});

// Set up task list route
app.get('/tasks', async (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Get tasks for current user
    try {
	    taskList = await Task.find({ username: req.session.username }).sort({dueDate: 1});
	    res.json(taskList);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
});

// Set up add task route
app.post('/tasks', async (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Create new task (node-side)
  const task = new Task
  ({
    description: req.body.description,
    completed: false,
    username: req.session.username,
    name: req.body.taskName,
    dueDate: req.body.dueDate,
  });
  console.log(task);
  console.log(req.body);
  // Save task to database
  try {
    await task.save();
    res.send('{}');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

// Set up update task route
app.put('/tasks/:id', async (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Get task ID from URL parameter
  const taskId = req.params.id;
  const taskContents = { 
	  name: req.body.name,
	  description: req.body.description,
	  completed: req.body.completed,
	  dueDate: req.body.dueDate
  }
  console.log(taskId);
  console.log(taskContents);
  // Update task in database
  var query = { _id: taskId, username: req.session.username };
  try {
	  await Task.findOneAndUpdate(query, taskContents);
	  res.redirect('/tasks');
  } catch (err) {
	  res.status(500).send('Internal server error');
  }
});

// Set up delete task route
app.delete('/tasks/:id', async (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Get task ID from URL parameter
  const taskId = req.params.id;

  // Delete task from database
  var query = { _id: taskId, username: req.session.username };
  try {
	  await Task.findOneAndDelete(query);
	  res.redirect('/tasks');
  } catch (err) { res.status(500).send('Internal server error'); }
});

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(port, () => {
  console.log(`Task manager app listening at http://localhost:${port}`);
});

