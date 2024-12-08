import { Typography } from '@mui/material';
import React from 'react';
import { usePatientMRN, useEncounterID } from '../../../../util/urlHelpers.js';

const getPatientPreChartingData = () => ({
  currentMedications: [
    {
      id: '123123',
      name: 'Metoprolol',
      dosage: '25mg',
      frequency: 'BID',
      startDate: '',
      endDate: '',
    },
  ],
  patientAllergies: [],
  medicalHistory: [
    { id: '123123', name: 'ulnar collateral reconstruction (R)', date: '2014-01-07' },
  ],
});

const PreChartingTabContent = ({ children, ...other }) => {
  const { currentMedications, patientAllergies, medicalHistory } = getPatientPreChartingData();
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const [enc, setEnc] = useEncounterID()

  return (
    <div className="tab-content-container">
      <div style={{ display: 'flex', flexDirection: "column", marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          History
        </Typography>
        <div style={{ display: 'flex', flexDirection: "column" }} className="sub-content-container">
          {medicalHistory.map(({ id, name, date }) => (
            <li key={id}>
              {name} / {date}
            </li>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: "column", marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          Allergies
        </Typography>
        <div className="sub-content-container">NKDA</div>
      </div>
      <div style={{ display: 'flex', flexDirection: "column", marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          Medications
        </Typography>
        <div style={{ display: 'flex', flexDirection: "column" }} className="sub-content-container">
          {currentMedications.map(({ id, name, dosage, frequency }) => (
            <li key={id}>
              {name} - {dosage} / {frequency}
            </li>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreChartingTabContent;
