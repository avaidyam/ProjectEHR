import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import NavBar from "./components/navigation/NavBar.js";
import Notewriter from "./components/notes/Notewriter.js";

const RootRouter = () => (
  <HashRouter>
    <div className="flex flex-col app-root">
      <NavBar />
      <div className="flex flex-col flex-grow content">
        <Routes>
          <Route path="/" Component={() => <div>EHR home</div>} />
          <Route path="/notes/:mrn?" Component={Notewriter} />
          {/* add subsequent routes here, ie /schedule, /chart_review, etc  */}
        </Routes>
      </div>
    </div>
  </HashRouter>
);

export default RootRouter;
