import {useState, useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";


export default function TaskPage({sessionID}) {
  const [taskList, setTaskList] = useState([]);
  const [openList, setOpenList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [isLoaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  if (!sessionID) {
    navigate('/');
  }

  useEffect(() => {
    if (!isLoaded) {
      // onload
      reload();
      setLoaded(true);
    }
  });

  async function reload(evt) {
    var openList = [];
    var completedList = [];

    console.log('TaskPage....');
    console.log(window.location.protocol);
    console.log(window.location.hostname);
    // var url = window.location.protocol + '//' + window.location.hostname + ':4000/tasks';
    var url = 'https://dev.aaronwebprogramming260.click/api/tasks?s=' + sessionID;
    console.log(url);
    try {
      var resp = await fetch(url);
      if (resp.ok) {
        var objList = await resp.json();
        console.log(objList);
        for (var ii = 0; ii < objList.length; ii++) {
          if (objList[ii].completed) {
            completedList.push( <Task key={ii} sessionID={sessionID} reload={reload} def={objList[ii]} isCompleted={true} /> );
          } else {
            openList.push( <Task key={ii} sessionID={sessionID} reload={reload} def={objList[ii]} isCompleted={false}/> );
          }
        }
      } else {
        throw 'Task fetch failed';
      }
    } catch (err) {
      console.log(err);
    }

    setOpenList(openList);
    setCompletedList(completedList);
  }

  return (
    <>
      <p>
        <Link to="/">Logout</Link>&nbsp;&nbsp;&nbsp;
        <a href="https://github.com/ajensen3point14/website-html">GitHub</a>
      </p>
      <p><strong>Created by: Aaron Jensen</strong></p>
      <h1>Task Manager (rendered via React)</h1>
      <NewTask reload={reload} sessionID={sessionID}/>
      <h3 style={{'textAlign':'left'}}>Open tasks</h3>
      <table>
        <thead>
          <td>Name</td><td>Due</td><td>Description</td>
        </thead>
        <tbody>
          {openList}
        </tbody>
      </table>
      <h3 style={{'textAlign':'left'}}>Completed tasks</h3>
      <table>
        <thead>
          <td>Name</td> <td>Due</td> <td>Description</td>
        </thead>
        <tbody>
          {completedList}
        </tbody>
      </table>
    </>
  )
}


function Task({reload, isCompleted, def, sessionID}) {
  async function onDelete() {
    var url = 'https://dev.aaronwebprogramming260.click/api/delete/' + def._id + '?s=' + sessionID;
    var resp = await fetch(url, {
      method:'POST',
      headers: {'Content-Type': 'text/plain'}
    });
    reload();
  }
  async function markComplete() {
    updateTask(true);
  }
  async function markOpen() {
    updateTask(false);
  }
  async function updateTask(complete) {
    var url = 'https://dev.aaronwebprogramming260.click/api/update/' + def._id + '?s=' + sessionID;
    var resp = await fetch(url, {
      method:'POST',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify({'name':def.name, 'dueDate':def.dueDate, 'description':def.description, 'completed':complete})
    });
    reload();
  }

  var btnTitle = isCompleted ? 'Re-open' : 'Complete task';
  var btnCallback = isCompleted ? markOpen : markComplete;

  return (
    <tr>
      <td>{def.name}</td>
      <td>{def.dueDate}</td>
      <td>{def.description}</td>
      <td>
        <button onClick={btnCallback}>{btnTitle}</button>&nbsp;&nbsp;
        <button onClick={onDelete}>Delete</button>
      </td>
    </tr>
  )
}

function NewTask({reload, sessionID}) {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  async function NewTask() {
    try {
      var url = 'https://dev.aaronwebprogramming260.click/api/tasks?s=' + sessionID;
      var resp = await fetch(url, {
        method:'POST',
        headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({name:name, dueDate:dueDate, description:description})
      });
      setName('');
      setDueDate('');
      setDescription('');
    } catch (err) {
      console.log('Error creating task: ' + err);
    }
    reload();
  }

  return (
    <div style={{'textAlign':'left'}}>
      <form>
        <h3>New task</h3>
        <table>
          <tbody>
            <tr>
              <td><label>Name:</label></td>
              <td><input type='text' required onChange={e => setName(e.target.value)} /></td>
            </tr>
            <tr>
              <td><label>Due date:</label></td>
              <td><input type='date' required onChange={e => setDueDate(e.target.value)} /></td>
            </tr>
            <tr>
              <td><label>Details:</label></td>
              <td><textarea type='text' onChange={e => setDescription(e.target.value)} /></td>
            </tr>
          </tbody>
        </table>
        <button type='button' onClick={NewTask}>Add Task</button>
      </form>
    </div>
  )
}
