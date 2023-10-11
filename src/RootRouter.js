import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import NavBar from './components/navigation/NavBar.js';
import NoteWriter from './components/notes/NoteWriter.js';
import Orders from './components/orders/Orders.js';
import PatientHome from './components/patient/PatientHome.js';
import Schedule from './components/schedule/Schedule.js';
import RadiologyViewer from './components/radiology/RadiologyViewer.js';

const home = () => <div>EHR home</div>;

const RootRouter = () => (
  <HashRouter>
    <div className="flex flex-col app-root">
      <NavBar />
      <div className="flex flex-col flex-grow content">
        <Routes>
          <Route path="/" Component={home} />
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
