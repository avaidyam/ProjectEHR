import { Box, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';

import ChartReviewTabContent from './tabContent/ChartReviewTabContent.js';
import PreChartingTabContent from './tabContent/PreChartingTabContent.js';
import RoomingTabContent from './tabContent/RoomingTabContent.js';
import SnapshotTabContent from './tabContent/SnapshotTabContent.js';
import ImagingTabContent from './tabContent/ImagingTabContent.js';
import NotesTabContent from './tabContent/NotesTabContent.js';
import HistoryTabContent from './tabContent/HistoryTabContent.js';

const TabControl = () => {
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
          <Tab label="Imaging" />
          <Tab label="Notes" />
          <Tab label="History" />
        </Tabs>
      </Box>
      {value === 0 && <PreChartingTabContent />}
      {value === 1 && <SnapshotTabContent />}
      {value === 2 && <ChartReviewTabContent />}
      {value === 3 && <RoomingTabContent />}
      {value === 4 && <ImagingTabContent />}
      {value === 5 && <NotesTabContent />}
      {value === 6 && <HistoryTabContent />}
    </>
  );
};

export default TabControl;
