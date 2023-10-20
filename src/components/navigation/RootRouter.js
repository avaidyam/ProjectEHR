import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import NavBar from './NavBar.js';
import Schedule from '../schedule/Schedule.js';
import PatientHome from '../patient/PatientHome.js';

const RootRouter = () => (
  <HashRouter>
    <div style={{
      display: "flex !important", 
      flexDirection: "column",
      minHeight: "100vh"
    }}>
      <NavBar />
      <div style={{
        display: "flex !important", 
        flexDirection: "column",
        flexGrow: 1,
        padding: "1em"
      }}
      >
        <Routes>
          <Route path="/" Component={Schedule} />
          <Route path="/schedule/" Component={Schedule} />
          <Route path="/patient/:mrn" Component={PatientHome} />
          {/* add subsequent routes here, ie /schedule, /chart_review, etc  */}
        </Routes>
      </div>
    </div>
  </HashRouter>
);

export default RootRouter;
