import { Typography } from '@mui/material';
import React from 'react';

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

const PreChartingTabContent = ({ children, value, index, ...other }) => {
  const { currentMedications, patientAllergies, medicalHistory } = getPatientPreChartingData();

  return (
    <div hidden={value !== index} className="tab-content-container">
      <div className="flex flex-col" style={{ marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          History
        </Typography>
        <div className="flex flex-col sub-content-container">
          {medicalHistory.map(({ id, name, date }) => (
            <li key={id}>
              {name} / {date}
            </li>
          ))}
        </div>
      </div>
      <div className="flex flex-col" style={{ marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          Allergies
        </Typography>
        <div className="sub-content-container">NKDA</div>
      </div>
      <div className="flex flex-col" style={{ marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          Medications
        </Typography>
        <div className="flex flex-col sub-content-container">
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
