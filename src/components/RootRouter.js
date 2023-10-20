import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import NavBar from './navigation/NavBar.js';
import NoteWriter from './notes/NoteWriter.js';
import Orders from './orders/Orders.js';
import PatientHome from './patient/PatientHome.js';
import Schedule from './schedule/Schedule.js';
import RadiologyViewer from './radiology/RadiologyViewer.js';

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
          <Route path="/notes/:mrn?" Component={NoteWriter} />
          <Route path="/schedule/" Component={Schedule} />
          <Route path="/orders/:mrn?" Component={Orders} />
          <Route path="/patient/:mrn" Component={PatientHome} />
          <Route path="/radiology/:mrn?" Component={RadiologyViewer} />
          {/* add subsequent routes here, ie /schedule, /chart_review, etc  */}
        </Routes>
      </div>
    </div>
  </HashRouter>
);

export default RootRouter;
