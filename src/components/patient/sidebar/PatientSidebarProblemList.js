import { Typography } from '@mui/material';
import React from 'react';

const TEST_PATIENT_INFO = ({ patientMRN }) => ({
  mrn: patientMRN,
  problems: [],
});

const PatientSidebarProblemList = ({ patientMRN }) => {
  const { problems } = TEST_PATIENT_INFO({ patientMRN });

  return (
    <div style={{ display: 'flex', flexDirection: "column" }} className="overview-card">
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Problem List ({problems.length})
      </Typography>
      <div style={{ display: 'flex', flexDirection: "column" }}>
        {problems.map((p) => (
          <div key={p.id}>{p.name}</div>
        ))}
      </div>
    </div>
  );
};

export default PatientSidebarProblemList;
