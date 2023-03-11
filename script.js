// get form element and task list element
const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const completedTasks = document.getElementById('completed-tasks');

// add event listener to form submit event
form.addEventListener('submit', function(e) {
	// prevent default form submission behavior
	e.preventDefault();

	// get task name, details, and due date from form inputs
	const taskName = document.getElementById('task-name').value;
	const taskDetails = document.getElementById('task-details').value;
	const dueDate = document.getElementById('due-date').value;

	// create new task object with task name, details, and due date
	const task = {
		name: taskName,
		details: taskDetails || '',
		dueDate: dueDate
	};

	// add task to task list
	addTask(task);

	// reset form
	form.reset();
});

// function to add task to task list
function addTask(task) {
	// create new list item element
	const li = document.createElement('li');

	// set inner HTML of list item element
	li.innerHTML = `
		<h3>${task.name}</h3>
		${task.details ? `<p>${task.details}</p>` : ''}
		<p>Due Date: ${task.dueDate}</p>
		<button class="complete-button">Complete Task</button>
		<button class="delete-button">Delete Task</button>
	`;

	// add event listener to complete button
	const completeButton = li.querySelector('.complete-button');
	completeButton.addEventListener('click', function() {
		// move task from task list to completed tasks
		li.classList.add('completed');
		completedTasks.appendChild(li);
	});
