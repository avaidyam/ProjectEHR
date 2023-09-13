import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import Notewriter from "./Notewriter";
import "./style.css";

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <Notewriter />
    </StyledEngineProvider>
  </React.StrictMode>,
);
