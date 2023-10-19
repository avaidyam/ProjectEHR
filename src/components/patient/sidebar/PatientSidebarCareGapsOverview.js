import { Typography } from '@mui/material';
import React from 'react';

const TEST_PATIENT_INFO = ({ patientMRN }) => ({
  mrn: patientMRN,
  careGaps: [
    { id: '1', name: 'COVID Booster #8' },
    { id: '2', name: 'COVID Booster #9' },
    { id: '3', name: 'Hypertension' },
  ],
});

const PatientSidebarCareGapsOverview = ({ patientMRN }) => {
  const { careGaps } = TEST_PATIENT_INFO({ patientMRN });

  return (
    <div className="flex flex-col overview-card">
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Care Gaps ({careGaps.length})
      </Typography>
      <div className="flex flex-col">
        {careGaps.map((c) => (
          <span key={c.id}>{c.name}</span>
        ))}
      </div>
    </div>
  );
};

export default PatientSidebarCareGapsOverview;
