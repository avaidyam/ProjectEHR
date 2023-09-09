import React from "react";
import ReactDOM from "react-dom";
import { Button } from "@mui/material";

function App() {
  return (
    <Button variant="contained" color="primary">
      Hello World
    </Button>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
