import { Typography } from '@mui/material';
import React from 'react';

const TEST_PATIENT_INFO = ({ patientMRN }) => ({
  mrn: patientMRN,
  problems: [],
});

const PatientSidebarProblemList = ({ patientMRN }) => {
  const { problems } = TEST_PATIENT_INFO({ patientMRN });

  return (
    <div className="flex flex-col overview-card">
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Problem List ({problems.length})
      </Typography>
      <div className="flex flex-col">
        {problems.map((p) => (
          <div key={p.id}>{p.name}</div>
        ))}
      </div>
    </div>
  );
};

export default PatientSidebarProblemList;
