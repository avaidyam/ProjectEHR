import React from "react";
import ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";

import Notewriter from "./components/notes/Notewriter";

import "./index.css";

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <Notewriter />
    </StyledEngineProvider>
  </React.StrictMode>
);
