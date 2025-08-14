import React, { useState } from 'react'
import { AppBar, Box, Tab, Tabs, Divider, Drawer, Stack, IconButton} from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Icon } from '../../components/ui/Core.jsx';

import { usePatientMRN, useEncounterID } from '../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../util/data/PatientSample.js';

import { Storyboard } from './components/Storyboard.jsx'
import { ChartReview } from './routes/ChartReview/ChartReview.jsx'
import ProblemListTabContent from './routes/ProblemList/ProblemList.jsx'
import SnapshotTabContent from './routes/Snapshot/Snapshot.jsx'
import NotesTabContent from './routes/NoteWriter/NoteWriter.jsx'
import { HistoryTabContent } from './routes/History/History.jsx'
import Orders from './routes/NewOrders/NewOrders.jsx';
import OrdersMgmt from './routes/OrdersManagement/OrdersManagement.jsx';
import Medications from './routes/Medications/Medications.jsx';
import ResultsReview from "./routes/Results/Results.jsx";
import Pdmp from './routes/PDMP/PDMP.jsx';
import Immunizations from './routes/Immunizations/Immunizations.jsx';
import { Allergies } from './routes/Allergies/Allergies.jsx';
import Chat from "./routes/Chat/Chat.jsx";

export const PatientHome = ({ ...props }) => {
  const [enc] = useEncounterID();
  const [patientMRN] = usePatientMRN();
  const [patientData, setPatientData] = useState(TEST_PATIENT_INFO({ patientMRN }));

  const drawerWidth = 250
  const [tab, setTab] = useState("1")
  const [storyboardOpen, setStoryboardOpen] = useState(true)
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

  return (
    <Box display="flex" direction="row" sx={{ overflowY: 'hidden', ...props.sx }} {...props}>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={!isMobile || storyboardOpen}
        onOpen={() => setStoryboardOpen(true)}
        onClose={() => setStoryboardOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            marginTop: 6, 
            boxSizing: 'border-box',
            overflow: 'auto', 
            flexShrink: 0, 
            flexGrow: 0, 
            backgroundColor: 'primary.main', 
            color: 'primary.contrastText', 
            p: 1
          },
        }}
      >
        <Storyboard /> 
      </Drawer>
      <Box sx={{ flexGrow: 1, overflowY: 'hidden' }}>
        <TabContext value={tab}>
          <Stack direction="row" sx={{ position: "sticky", top: 0, width: "100%", zIndex: 100, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <IconButton
              color="inherit"
              onClick={() => setStoryboardOpen(!storyboardOpen)}
              edge="start"
              sx={[{ ml: 1 }, !isMobile && { display: 'none' }]}
            >
              <Icon>menu</Icon>
            </IconButton>
            <TabList 
              variant="scrollable" 
              textColor="inherit"
              scrollButtons="auto"
              allowScrollButtonsMobile 
              TabIndicatorProps={{ style: { backgroundColor: '#fff' }}}
              onChange={(event, newValue) => setTab(newValue)}
            >
              <Tab value="1" label="SnapShot" />
              <Tab value="2" label="Chart Review" />
              <Tab value="3" label="Problem List" />
              <Tab value="4" label="History" />
              <Tab value="5" label="Medications" />
              <Tab value="6" label="Orders" />
              <Tab value="7" label="Orders Mgmt" />
              <Tab value="8" label="NoteWriter" />
              <Tab value="9" label="Results Review" />
              <Tab value="10" label="PDMP" />
              <Tab value="11" label="Immunizations" />
              <Tab value="12" label="Allergies" />
              <Tab value="13" label="Chat" />
            </TabList>
          </Stack>
          <Box sx={{ overflowY: 'auto' }}>
            <TabPanel sx={{ p: 0 }} value="1"><SnapshotTabContent /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="2"><ChartReview /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="3"><ProblemListTabContent /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="4"><HistoryTabContent /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="5"><Medications /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="6"><Orders /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="7"><OrdersMgmt/></TabPanel>
            <TabPanel sx={{ p: 0 }} value="8"><NotesTabContent /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="9"><ResultsReview/></TabPanel>
            <TabPanel sx={{ p: 0 }} value="10"><Pdmp/></TabPanel>
            <TabPanel sx={{ p: 0 }} value="11"><Immunizations/></TabPanel>
            <TabPanel sx={{ p: 0 }} value="12"><Allergies /></TabPanel>
            <TabPanel sx={{ p: 0 }} value="13"><Chat /></TabPanel>
          </Box>
        </TabContext>
      </Box>
    </Box>
  )
}
