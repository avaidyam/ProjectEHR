import { Box, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';

import ChartReviewTabContent from './tabContent/ChartReviewTabContent.js';
import PreChartingTabContent from './tabContent/PreChartingTabContent.js';
import RoomingTabContent from './tabContent/RoomingTabContent.js';
import SnapshotTabContent from './tabContent/SnapshotTabContent.js';

const TabControl = ({ patientMRN }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Pre-Charting" />
          <Tab label="SnapShot" />
          <Tab label="Chart Review" />
          <Tab label="Rooming" />
        </Tabs>
      </Box>
      <PreChartingTabContent value={value} index={0} patientMRN={patientMRN} />
      <SnapshotTabContent value={value} index={1} patientMRN={patientMRN} />
      <ChartReviewTabContent value={value} index={2} patientMRN={patientMRN} />
      <RoomingTabContent value={value} index={3} patientMRN={patientMRN} />
    </>
  );
};

export default TabControl;
