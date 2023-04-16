// get form element and task list element
const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const completedTasks = document.getElementById('completed-tasks');
const weatherInfo = document.getElementById('weather');

// add event listener to fetch tasks from Node
window.addEventListener('load', async (e) => {
	const response = await fetch('/tasks', {
		method: 'GET'
	});
	var taskList = await response.json();

	// Iterate through array and populate the DOM
	taskList.filter(addTask);

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
	const taskName = document.getElementById('task-name').value;
        const taskDetails = document.getElementById('task-details').value;
        const dueDate = document.getElementById('due-date').value;
	
	const response = await fetch('/tasks', {
	  method: 'POST',
	  headers: {
		'Accept' : 'application/json',
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
	    taskName:taskName,
	    description:taskDetails,
	    dueDate:dueDate
	  })
	});

	try {
	const content = await response.json();
	location.reload();
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
	  location.reload();
	} catch (err) { alert(err); }
}

async function deleteTask(taskId) {
	try {
	  await fetch('/tasks/' + taskId, { method: 'DELETE' });
	  location.reload();
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
/*
	// add event listener to delete button
	const deleteButton = li.querySelector('.delete-button');
	deleteButton.addEventListener('click', function() {
		// remove task from task list or completed tasks
		if (li.classList.contains('completed')) {
			completedTasks.removeChild(li);
		} else {
			taskList.removeChild(li);
		}
	});
*/
	// add new list item to task list
	taskList.appendChild(li);
}
