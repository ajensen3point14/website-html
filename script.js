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
