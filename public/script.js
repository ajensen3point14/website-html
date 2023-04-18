// get form element and task list element
const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const completedTasks = document.getElementById('completed-tasks');
const weatherInfo = document.getElementById('weather');

var socket;

// add event listener to fetch tasks from Node
window.addEventListener('load', async (e) => {
  console.log('running scripts on page...');
  const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
  socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
  socket.onopen = (event) => {
      console.log('Socket opened');
      socket.send('{"message":"client says hi"}');
  };

  socket.onmessage = function(evt) {
      var data = evt.data;
      console.log('received: ' + JSON.parse(data));
      tasks = JSON.parse(data);
      taskList.innerHTML = '';
      completedTasks.innerHTML = '';
      tasks.filter(addTask);
  };

  socket.onclose = function() {
      console.log('Socket closed');
  };
  console.log(socket);
  console.log('Done'); 	

	// Fetch the weather
	const weather = await fetch('/weather', { method: 'GET' });
	var weatherVar = await weather.json();
	forecast = weatherVar[0]["forecast"][0];
	weatherInfo.innerHTML = `
		${weatherVar[0]["location"]["name"]} weather for 
		${forecast.day} : ${forecast["skytextday"]} | low:
		${forecast["low"]} | high: ${forecast["high"]} | rain chance: 
		${forecast["precip"]}%
	`;
});

// add event listener to form submit event
form.addEventListener('submit', async (e) => {
	// prevent default form submission behavior
	e.preventDefault();
	const taskName = document.getElementById('task-name');
        const taskDetails = document.getElementById('task-details');
        const dueDate = document.getElementById('due-date');
	
	const response = await fetch('/tasks', {
	  method: 'POST',
	  headers: {
		'Accept' : 'application/json',
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
	    taskName:taskName.value,
	    description:taskDetails.value,
	    dueDate:dueDate.value
	  })
	});

	try {
	const content = await response.json();
  socket.send('{}');
  taskName.value = '';
  taskDetails.value = '';
  dueDate.value = '';
	} catch (error) { 
	  alert(error); 
	  return; 
	}

});

taskArray = [];
async function editTask(taskId, index) {
	try {
	  await fetch('/tasks/' + taskId, {
		method: 'PUT',
		headers: {
		  'Accept': 'application/json',
		  'Content-type': 'application/json'
		},
		body: JSON.stringify(taskArray[index])
	  });
    socket.send('{}');
	} catch (err) { alert(err); }
}

async function deleteTask(taskId) {
	try {
	  await fetch('/tasks/' + taskId, { method: 'DELETE' });
    socket.send('{}');
	} catch (err) { alert(err); }
}

function addTask(task) {
	if(task.completed == true) {addCompletedTask(task); }
	else { addOpenTask(task); }
}

// function to add task to task list
function addCompletedTask(task) {
        // create new list item element
        const li = document.createElement('li');
	li.classList.add('completed');
        taskArray.push(task);
        var index = taskArray.length - 1;
        // set inner HTML of list item element
        li.innerHTML = `
                <h3>${task.name}</h3>
                ${task.description ? `<p>${task.description}</p>` : ''}
                <p>Due Date: ${task.dueDate}</p>
		<button onclick="taskArray[${index}].completed=false;editTask('${task._id}', ${index})" class="complete-button">Reopen Task</button>
		<button onclick="deleteTask('${task._id}')" class="delete-button">Delete Task</button>
        `;

        completedTasks.appendChild(li);
}

// function to add task to task list
function addOpenTask(task) {
	// create new list item element
	const li = document.createElement('li');
	taskArray.push(task);
	var index = taskArray.length - 1;
	// set inner HTML of list item element
	li.innerHTML = `
		<h3>${task.name}</h3>
		${task.description ? `<p>${task.description}</p>` : ''}
		<p>Due Date: ${task.dueDate}</p>
		<button onclick="taskArray[${index}].completed=true;editTask('${task._id}', ${index})" class="complete-button">Complete Task</button>
		<button onclick="deleteTask('${task._id}')" class="delete-button">Delete Task</button>
	`;

	// add new list item to task list
	taskList.appendChild(li);
}
