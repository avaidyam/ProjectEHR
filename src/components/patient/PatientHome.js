import React from 'react';
import { useParams } from 'react-router-dom';

import TabControl from './TabControl.js';
import PatientSidebar from './sidebar/PatientSidebar.js';

import './PatientHome.css';

const PatientHome = () => {
  const { mrn } = useParams();

  return (
    <div className="flex patient-home-container">
      <PatientSidebar patientMRN={mrn} />
      <div className="flex flex-col" style={{ flex: 3 }}>
        <TabControl patientMRN={mrn} />
      </div>
    </div>
  );
};

export default PatientHome;
