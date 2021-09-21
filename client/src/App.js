import Editor from "./Editor";
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <Redirect to={`/documents/${uuidv4()}`} />
        </Route>
        <Route path='/documents/:id'>
          <Editor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
