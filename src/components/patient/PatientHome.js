import React, { useState } from 'react'
import { Box, Tab, Tabs, Divider, Toolbar, Typography, Avatar, Fade, Paper, Popper, TextField } from '@mui/material'

import { Storyboard } from './Storyboard.js'
import { ChartReview } from './tabs/chartreview/ChartReviewTabContent.js'
import PreChartingTabContent from './tabs/snapshot/PreChartingTabContent.js'
import RoomingTabContent from './tabs/snapshot/RoomingTabContent.js'
import SnapshotTabContent from './tabs/snapshot/SnapshotTabContent.js'
import ImagingTabContent from './tabs/chartreview/ImagingTabContent.js'
import NotesTabContent from './tabs/notewriter/NotesTabContent.js'
import HistoryTabContent from './tabs/history/HistoryTabContent.js'
import Orders from './tabs/orders/Orders.js';

export const PatientHome = ({ ...props }) => {
  const drawerWidth = 250
  const [tab, setTab] = useState(0)
  return (
    <Box display="flex" direction="row" {...props}>
      <Paper square elevation={8} sx={{ width: drawerWidth, height: '100vh', overflow: 'auto', flexShrink: 0, flexGrow: 0, backgroundColor: 'primary.main', color: 'primary.contrastText', p: 1 }}>
          <Storyboard /> 
      </Paper>
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Tabs value={tab} onChange={(event, newValue) => setTab(newValue)}>
          <Tab label="SnapShot" />
          <Tab label="Chart Review" />
          <Tab label="Pre-Charting" />
          <Tab label="Rooming" />
          <Tab label="Imaging" />
          <Tab label="NoteWriter" />
          <Tab label="History" />
          <Tab label="Orders" />
        </Tabs>
        <Divider />
        {tab === 0 && <SnapshotTabContent />}
        {tab === 1 && <ChartReview />}
        {tab === 2 && <PreChartingTabContent />}
        {tab === 3 && <RoomingTabContent />}
        {tab === 4 && <ImagingTabContent />}
        {tab === 5 && <NotesTabContent />}
        {tab === 6 && <HistoryTabContent />}
        {tab === 7 && <Orders />}
      </Box>
    </Box>
  )
}
