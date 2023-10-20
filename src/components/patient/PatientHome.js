import React from 'react';
import { useParams } from 'react-router-dom';

import TabControl from './TabControl.js';
import PatientSidebar from './sidebar/PatientSidebar.js';

import './PatientHome.css';

const PatientHome = () => {
  const { mrn } = useParams();

  return (
    <div style={{ display: "flex" }} className="patient-home-container">
      <PatientSidebar patientMRN={mrn} />
      <div style={{ display: 'flex', flexDirection: "column", flex: 3 }}>
        <TabControl patientMRN={mrn} />
      </div>
    </div>
  );
};

export default PatientHome;
