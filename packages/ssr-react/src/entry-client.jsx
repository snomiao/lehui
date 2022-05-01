import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { App } from "./App";
import { Debug } from "./Debug";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/">
        <App />
      </Route>
      <Route exact path="/debug">
        <Debug />
      </Route>
    </Switch>

    {/* <App /> */}
  </BrowserRouter>,
  document.getElementById("app"),
);
