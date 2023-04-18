import logo from './logo.svg';
import {useState, StrictMode} from 'react';
import ReactDOM from "react-dom/client";
import {Routes, Route, BrowserRouter, useNavigate} from "react-router-dom";

import './App.css';

import Login from './Login';
import Tasks from './Tasks';

function App() {
  const [sessionID, setSessionID] = useState('');

  // let mainElement;

  function OnLoggedIn(sessionID)  {
    setSessionID(sessionID);
    /*
    return (
      <p>Hello!</p>
    ) */
  }

  var loginComponent = <Login onloggedin={OnLoggedIn} />
  var tasksComponent = <Tasks sessionID={sessionID} />

  /*
  if (!sessionID) {
    mainElement = <Login onloggedin={OnLoggedIn} />
  } else {
    mainElement = <Tasks sessionID={sessionID} />
  } */

  return (
    <div class='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/tasks" element={tasksComponent} />
          <Route path="*" element={loginComponent} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}


export default App;
