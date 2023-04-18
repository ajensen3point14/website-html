# React startup (extra credit)
Accessible from [react.aaronwebprogramming260.click].

## Changes to the startup

Per the rubric, the following changes have been made:
#### 30% Multiple React components
- App, Login, Task, TextField, TaskPage, Task, NewTask
- In github, these can be found under website-html/react-client
#### 20% React router 
- See App.js
#### 20% React hooks
- Used through the "const [val, setVal] = useState(...)" pattern
- Used throughout all components, since this is the de facto way to pass data from parents into children (and for child components to invoke callbacks in their parents)
- Also used the"useEffect" hook in Tasks.js
#### 10% Bundled using Babel
- All JS is compiled through Babel automatically every time you run "npm run build"
#### 10% Multiple git commits
- see github repository
#### 10% Notes in README.md and notes.md
- See below

## Notes
In project directory, run `npm install react`
Then run `npm install -g create-react-app`

In react each function controls a part of a screen.

JS componenets need to start with a capital letter.

React blends html and js in one convenient location.

HTML can only be returned in a single tag, but it can be a dummy tag and hold
a bunch of others.

The direction matters - parents can pass info to child elements/components, but child components can't pass
data back to parents. To have children notify parents, pass a callback in from the parent that the child
can invoke.

react rendering happens dynamically in the client.

`npm run build` - this will run Babel so other systems can read my code, and will help me get the client js

React offers an interesting approach, with some nice network efficiencies. React can minimize the amount of network traffic going back and forth from a server, 
for example, since instead of loading the entire page, it can enable an approach where only the updated part of a page needs to be reloaded.

Since React is so popular, there are tons of resources available on line.

You can come up to speed on React fairly quickly (in just a few days).

I'm not sure if React can help manage CSS issues (like large global CSS files, or tiny CSS files spread across all different pages). 

React very well may help in this case, but I didn't use CSS much in this project so I'm not sure.

Coding a React web app did require that I add more APIs to the backend server. But having done so, I now see how I could have changed my API design 
to share more backend entry points between the React web app and the normal HTML app.

Automatic integration with Babel is really nice.

Having a compilation step is nice too -- it provides a chance to run analysis and optimization tools, and then deliver an app as a small set of css & js files.

I did find that React errors can sometimes be hard to diagnose and resolve. Maybe that's just because I'm new to React, but that's something to think 
about when using a library like this. While moving up to higher-level abstractions can be powerful, when things go wrong it can make it much harder 
to figure out what's going on.
