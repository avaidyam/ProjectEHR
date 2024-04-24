import React, { useState } from 'react';
import { Box, Tab, Tabs, Divider, Toolbar, Typography, Avatar, Fade, Paper, Popper, TextField } from '@mui/material';

import { Storyboard } from './Storyboard.js'
import ChartReviewTabContent from './tabContent/ChartReviewTabContent.js';
import PreChartingTabContent from './tabContent/PreChartingTabContent.js';
import RoomingTabContent from './tabContent/RoomingTabContent.js';
import SnapshotTabContent from './tabContent/SnapshotTabContent.js';
import ImagingTabContent from './tabContent/ImagingTabContent.js';
import NotesTabContent from './tabContent/NotesTabContent.js';
import HistoryTabContent from './tabContent/HistoryTabContent.js';
import Orders from './tabContent/Orders.js';

export const PatientHome = ({ ...props }) => {
  const drawerWidth = 250
  const [tab, setTab] = useState(0)
  return (
    <Box display="flex" direction="row">
      <Box sx={{ width: drawerWidth, height: '100vh', overflow: 'auto', flexShrink: 0, flexGrow: 0 }}>
          <Storyboard /> 
          <Divider orientation="vertical" />
      </Box>
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Tabs value={tab} onChange={(event, newValue) => setTab(newValue)}>
          <Tab label="Pre-Charting" />
          <Tab label="SnapShot" />
          <Tab label="Chart Review" />
          <Tab label="Rooming" />
          <Tab label="Imaging" />
          <Tab label="NoteWriter" />
          <Tab label="History" />
          <Tab label="Orders" />
        </Tabs>
        <Divider />
        {tab === 0 && <PreChartingTabContent />}
        {tab === 1 && <SnapshotTabContent />}
        {tab === 2 && <ChartReviewTabContent />}
        {tab === 3 && <RoomingTabContent />}
        {tab === 4 && <ImagingTabContent />}
        {tab === 5 && <NotesTabContent />}
        {tab === 6 && <HistoryTabContent />}
        {tab === 7 && <Orders />}
      </Box>
    </Box>
  );
}
