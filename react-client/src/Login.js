import {useState} from 'react';
import {useNavigate} from "react-router-dom";


export default function Login({onloggedin}) {
  const [msg, setMsg] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msgColor, setMsgColor] = useState('blue');
  const navigate = useNavigate();

  function showMsg(m, isError=false) {
    setMsg(m);
    setMsgColor(isError ? "red" : "blue");
  }

  async function Login(e) {
    e.preventDefault();
    DoPost(false);
  }

  async function Create(e) {
    e.preventDefault();
    DoPost(true);
  }

  async function DoPost(register=false) {
    try {
      showMsg('');
      console.log('Logging in/registering...' + username + ' / ' + password);
      // onloggedin();
      // return;

      var url = 'https://dev.aaronwebprogramming260.click/api/';
      if (register) { url += 'register'; }
      else { url += 'login'; }
      console.log(url);
      var resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({'username':username, 'password':password}),
      });
      if (resp.ok) {
        console.log('OK response, reading response data');
        var responseData = await resp.json();
        console.log('logged in successfully...body: ' + JSON.stringify(responseData));
        onloggedin(responseData._id);

        navigate('/tasks');
      } else {
        throw 'Login failed';
      }
    } catch (err) {
      console.log(err);
      var verb = register ? "Account creation" : "Login";
      showMsg(verb + ' failed', true);
    }
  }

  return (
    <div>
      <h1>Task Manager Login (Rendered via React)</h1>
      <form>
        <table style={{margin:'0 auto'}}>
          <tbody>
            <TextInput label="Username" name="username" setter={setUsername} />
            <TextInput label="Password" name="password" setter={setPassword} />
          </tbody>
        </table>
        <button name="Login" value="1" type="button" onClick={Login}>Login</button>&nbsp;&nbsp;
        <button name="Create" value="1" type="button" onClick={Create}>Create</button>
      </form>
      <p style={{'color':msgColor}}>{msg}</p>
    </div>
  )
}

function TextInput({label, name, setter}) {
  function updateValue(evt) {
    setter(evt.target.value);
  }

  return (
    <tr>
      <td><label htmlFor="{name}_id">{label}: </label></td>
      <td><input type="text" name="{name}" id="{name}_id" onChange={updateValue} /></td>
    </tr>
  )
}
