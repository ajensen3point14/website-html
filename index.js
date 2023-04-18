const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const app = express();
var expressWs = require('express-ws') (app);
const port = 3500;
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

// API token expiration (used by react client)
const apiSessionSchema = new mongoose.Schema({
  username: String,
  expiration: Date
});
const APISession = mongoose.model('APISession', apiSessionSchema);


// Set up session middleware
sessionParser = session({
  secret: 'Frank-lowly.Ripcode;ninety-seven!',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({client})
});

app.use(sessionParser);

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.post('/api/register', async (req, res) => {
  var username, password;
  console.log('Post to /api/register; req.body: ' + JSON.stringify(req.body));

  var data = JSON.parse(req.body);
  username = data.username;
  password = data.password;

  try {
    // Ensure username is valid
    if (password.length == 0 || username.length == 0) throw Error('Must provide a username and password');
    
    var validUser = await User.findOne({ username: username });
    if (validUser != null) throw Error('User already exists');
    const saltRounds = 10;
    h = await bcrypt.hash(password, saltRounds);
    validUser = await User({username: username, passwordHash: h}).save();
    console.log('Valid user: '+ validUser);

    // Save APISessions entry, and clear out any old items
    console.log('Deleting old sessions');
    await APISession.deleteMany({'username':username});
    console.log('Prepping exp date');
    var exp = new Date();
    exp = exp.setTime(exp.getTime() + (3600*1));
    console.log('exp date: ' + exp);
    var session = await APISession({'username':username, 'expiration':exp}).save();
    console.log('Created API session');
    // Send success response
    res.send(JSON.stringify(session));

  } catch (ex) { res.status(500).send('{}'); }
});

app.post('/api/login', async (req, res) => {
  var username, password;
  console.log('Post to /api/login; req.body: ' + JSON.stringify(req.body));

  var data = JSON.parse(req.body);
  username = data.username;
  password = data.password;

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
      // Save APISessions entry, and clear out any old items
      console.log('Deleting old sessions');
      await APISession.deleteMany({'username':username});
      console.log('Prepping exp date');
      var exp = new Date();
      exp = exp.setTime(exp.getTime() + (3600*1));
      console.log('exp date: ' + exp);
      var session = await APISession({'username':username, 'expiration':exp}).save();
      console.log('Created API session');
      // Send success response
      res.send(JSON.stringify(session));
    }

  } catch (ex) { res.status(500).send('{}'); }
});

app.get('/api/tasks', async (req, res) => {
  var username, password;
  console.log('GET /api/tasks');

  var sessionID = req.query.s;
  if (!sessionID) {
    res.status(400).send('{}');
    return;
  }
  console.log('sessionID: ', sessionID);

  try {
    var sess = await APISession.findById(sessionID);
    if (!sess) {
      res.status(400).send('{}');
      return;
    }
    var username = sess.username;
    taskList = await Task.find({ username: username }).sort({dueDate: 1});
    res.send(JSON.stringify(taskList));
  } catch (ex) {
    console.log('Error: ' + ex);
    res.status(500).send('{}');
  }
});

app.post('/api/tasks', async (req, res) => {
  var username, password;
  console.log('POST /api/tasks');

  var data = JSON.parse(req.body);
  name = data.name;
  dueDate = data.dueDate;
  description = data.description;

  var sessionID = req.query.s;
  if (!sessionID) {
    res.status(400).send('{}');
    return;
  }
  console.log('sessionID: ', sessionID);

  try {
    var sess = await APISession.findById(sessionID);
    if (!sess) {
      res.status(400).send('{}');
      return;
    }
    var username = sess.username;
    var task = await Task({username:username, name:name, dueDate:dueDate, description:description}).save();
    res.send(JSON.stringify(task));
  } catch (ex) {
    console.log('Error: ' + ex);
    res.status(500).send('{}');
  }
});

app.post('/api/delete/:id', async (req, res) => {
  var username, password;
  console.log('POST /api/delete');

  const taskId = req.params.id;

  var sessionID = req.query.s;
  if (!sessionID) {
    res.status(400).send('{}');
    return;
  }
  console.log('sessionID: ', sessionID);

  try {
    var sess = await APISession.findById(sessionID);
    if (!sess) {
      res.status(400).send('{}');
      return;
    }
    var username = sess.username;
    var task = await Task.deleteMany({username:username, _id:taskId});
    res.send('{}');
  } catch (ex) {
    console.log('Error: ' + ex);
    res.status(500).send('{}');
  }
});

app.post('/api/update/:id', async (req, res) => {
  var username, password;
  console.log('POST /api/update');

  const taskId = req.params.id;
  var data = JSON.parse(req.body);
  name = data.name;
  dueDate = data.dueDate;
  description = data.description;
  completed = data.completed;

  var sessionID = req.query.s;
  if (!sessionID) {
    res.status(400).send('{}');
    return;
  }
  console.log('sessionID: ', sessionID);

  try {
    var sess = await APISession.findById(sessionID);
    if (!sess) {
      res.status(400).send('{}');
      return;
    }
    var username = sess.username;
    var query = { _id: taskId, username: username };
    var task = await Task.findOneAndUpdate(query, {name:name, dueDate:dueDate, description:description, completed:completed});
    res.send(JSON.stringify(task));
  } catch (ex) {
    console.log('Error: ' + ex);
    res.status(500).send('{}');
  }
});


// Add weather functionality
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
  var username, password;
  var data;
  console.log('Post to login; req.body: ' + JSON.stringify(req.body));

  if (req.is('text/plain')) {
    data = JSON.parse(req.body);
  } else if (req.is('application/json')) {
    data = req.body;
  }
  username = data.username;
  password = data.password;

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


app.get('/tasks', async (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Get tasks for current user
  try {
    taskList = await Task.find({ username: req.session.username }).sort({dueDate: 1});
    socket.send(JSON.stringify(taskList));
  } catch (err) {
    console.error(err);
    socket.send('[]');
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
    res.send('{}');
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
    res.send('{}');
  } catch (err) { res.status(500).send('Internal server error'); }
});

async function sendTasks(socket, req) { 
  // Check if user is logged in
  if (!req.session.userId) {
    socket.send('[]');
    return;
  }

  // Get tasks for current user
    try {
	    taskList = await Task.find({ username: req.session.username }).sort({dueDate: 1});
      socket.send(JSON.stringify(taskList));
    } catch (err) {
      console.error(err);
        socket.send('[]');
    }
}

// Websocket logging
app.ws('/ws', async (socket, req) => {
  console.log('  ws connected')
  sendTasks(socket, req);
  socket.on('message', function(msg) {
    sendTasks(socket, req);
    console.log("  Read from ws: " + msg);
  });
});

// Serve static files
app.use(express.static('public'));

// Enable endpoint for react app
app.use('/react', express.static('react-client/build'));

// Start server
app.listen(port, () => {
  console.log(`Task manager app listening at http://localhost:${port}`);
});

