import logo from './logo.svg';
import {useState} from 'react';

import './App.css';

import Login from './Login';
import Tasks from './Tasks';


function App() {
  const [sessionID, setSessionID] = useState('');

  let mainElement;

  function OnLoggedIn(sessionID)  {
    setSessionID(sessionID);
    return (
      <p>Hello!</p>
    )
  }

  if (!sessionID) {
    mainElement = <Login onloggedin={OnLoggedIn} />
  } else {
    mainElement = <Tasks sessionID={sessionID} />
  }

  return (
    <div className="App">
      {mainElement}
    </div>
  )
}


export default App;
