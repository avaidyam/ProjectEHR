import React from 'react';
import { useParams } from 'react-router-dom';

import { usePatientMRN } from '../../util/urlHelpers.js';
import PatientInfo from './PatientInfo.js';
import TabControl from './TabControl.js';

import './PatientHome.css';

const PatientHome = () => {
  const { mrn } = useParams();

  return (
    <div className="flex patient-home-container">
      <PatientInfo patientMRN={mrn} />
      <div className="flex flex-col" style={{ flex: 3 }}>
        <TabControl />
      </div>
    </div>
  );
};

export default PatientHome;
