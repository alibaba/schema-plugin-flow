import React from 'react';
import ReactDom from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import FormPanel from './formPanel';
import Main from './main';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/form-demo">
          <FormPanel />
        </Route>
        <Route path="/">
          <Main />
        </Route>
      </Switch>
    </Router>
  );
}

ReactDom.render(
  <App />,
  document.getElementById('root')
);
