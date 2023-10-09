import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';

import EncounterTabContent from './ChartReview/EncounterTabContent.js';
import NoteTabContent from './ChartReview/NoteTabContent.js';
import ImagingTabContent from './ChartReview/ImagingTabContent.js';


const ChartReviewTabContent = ({ children, value, index, patientMRN, ...other }) => {
  const [subValue, setValue] = useState(0);

  const handleChange = (event, newValue) => setValue(newValue);
  return (
    <div hidden={value !== index} className="tab-content-container">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subValue} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Encounters" />
          <Tab label="Note" />
          <Tab label="Imaging" />
          <Tab label="Lab" />
          <Tab label="Cardiac" />
          <Tab label="Specialty Test" />
          <Tab label="Other" />
          <Tab label="Meds" />
          <Tab label="Letter" />
          <Tab label="Referrals" />
        </Tabs>
      </Box>
      <EncounterTabContent value={subValue} index={0} patientMRN={patientMRN} />
      <NoteTabContent value={subValue} index={1} patientMRN={patientMRN} />
      <ImagingTabContent value={subValue} index={2} patientMRN={patientMRN} />

    </div>
  );
};


//<LabContent value={subValue} index={3} patientMRN={patientMRN} />
//<CardiacContent value={subValue} index={4} patientMRN={patientMRN} />
//<SpecialtyTestContent value={subValue} index={5} patientMRN={patientMRN} />
//<OtherContent value={subValue} index={6} patientMRN={patientMRN} />
//<Meds value={subValue} index={7} patientMRN={patientMRN} />
//<Letter value={subValue} index={8} patientMRN={patientMRN} />
//<Referrals value={subValue} index={9} patientMRN={patientMRN} />

export default ChartReviewTabContent;


