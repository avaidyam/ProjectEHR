import React, { useState } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { AppBar, Box, Tab, Tabs, Divider, Drawer, Stack, IconButton, Chip, Menu, MenuItem } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Icon } from '../../components/ui/Core.jsx';
import { SplitViewContext, SplitViewProvider, useSplitView } from '../../components/contexts/SplitViewContext.jsx';

import { usePatientMRN, useEncounterID } from '../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../util/data/PatientSample.js';

import { Storyboard } from './components/Storyboard.jsx'
import { ChartReview } from './routes/ChartReview/ChartReview.jsx'
import ProblemListTabContent from './routes/ProblemList/ProblemList.jsx'
import SnapshotTabContent from './routes/Snapshot/Snapshot.jsx'
import NotesTabContent from './routes/NoteWriter/NoteWriter.jsx'
import HistoryTabContent from './routes/History/History.jsx'
import Orders from './routes/NewOrders/NewOrders.jsx';
import OrdersMgmt from './routes/OrdersManagement/OrdersManagement.jsx';
import Medications from './routes/Medications/Medications.jsx';
import ResultsReview from "./routes/Results/Results.jsx";
import Pdmp from './routes/PDMP/PDMP.jsx';
import Immunizations from './routes/Immunizations/Immunizations.jsx';
import { Allergies } from './routes/Allergies/Allergies.jsx';
import Chat from "./routes/Chat/Chat.jsx";
import LabReport from './routes/LabReport/LabReport.jsx';
import ImagingViewer from './routes/ImagingViewer/ImagingViewer.jsx';
import NoteViewer from './routes/NoteViewer/NoteViewer.jsx';

const ALL_TABS = {
  "SnapShot": (props) => <SnapshotTabContent {...props} />,
  "Chart Review": (props) => <ChartReview {...props} />,
  "Problem List": (props) => <ProblemListTabContent {...props} />,
  "History": (props) => <HistoryTabContent {...props} />,
  "Medications": (props) => <Medications {...props} />,
  "Orders": (props) => <Orders {...props} />,
  "Orders Mgmt": (props) => <OrdersMgmt {...props} />,
  "NoteWriter": (props) => <NotesTabContent {...props} />,
  "Results Review": (props) => <ResultsReview {...props} />,
  "PDMP": (props) => <Pdmp {...props} />,
  "Immunizations": (props) => <Immunizations {...props} />,
  "Allergies": (props) => <Allergies {...props} />,
  "Chat": (props) => <Chat {...props} />
}

const CUSTOM_TABS = {
  "Lab Report": (props) => <LabReport {...props} />,
  "Imaging Viewer": (props) => <ImagingViewer {...props} />,
  "Note": (props) => <NoteViewer {...props} />,
}

const TabWithMenu = ({ onMove, onClose, ...props }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  return (
    <>
    <Tab
      onContextMenu={(event) => {
        event.preventDefault()
        setAnchorEl(event.currentTarget)
      }}
      {...props}
    />
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={() => setAnchorEl(null)}>
      <MenuItem onClick={onMove}>Move to Sidebar</MenuItem>
      <MenuItem onClick={onClose}>Close</MenuItem>
    </Menu>
    </>
  )
}

export const Patient = ({ ...props }) => {
  const [enc] = useEncounterID();
  const [patientMRN] = usePatientMRN();
  const [patientData, setPatientData] = useState(TEST_PATIENT_INFO({ patientMRN }));

  const drawerWidth = 250
  const [customTabs, setCustomTabs] = useState([])
  const [sideTabs, setSideTabs] = useState(["Orders", "PDMP", "Chat"])
  const [mainTab, setMainTab] = useState("SnapShot")
  const [sideTab, setSideTab] = useState("Orders")
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
        <SplitViewContext.Provider value={[customTabs, setCustomTabs]}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={35}>
              <TabContext value={mainTab}>
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
                    onChange={(event, newValue) => setMainTab(newValue)}
                  >
                    {Object.keys(ALL_TABS).filter(x => isMobile || !sideTabs.includes(x)).map((tab, index) => (
                      <TabWithMenu key={tab} value={tab} label={tab} onMove={() => setSideTabs(prev => [...prev, tab])} />
                    ))}
                    {customTabs.flatMap(x => Object.entries(x)).filter(([k, v]) => Object.keys(CUSTOM_TABS).includes(k)).map(([k, v], i) => (
                      <TabWithMenu key={`${k}-${i}`} value={`${k}-${i}`} label={k} onClose={() => setCustomTabs(prev => prev.filter((x2, i2) => i2 !== i))} />
                    ))}
                  </TabList>
                </Stack>
                <Box sx={{ overflowY: 'auto', height: "100%" }}>
                  {Object.keys(ALL_TABS).map((tab, index) => (
                    <TabPanel sx={{ p: 0 }} key={tab} value={tab}>{ALL_TABS[tab]()}</TabPanel>
                  ))}
                  {customTabs.flatMap(x => Object.entries(x)).filter(([k, v]) => Object.keys(CUSTOM_TABS).includes(k)).map(([k, v], i) => (
                    <TabPanel sx={{ p: 0 }} key={`${k}-${i}`} value={`${k}-${i}`}>{CUSTOM_TABS[k](v)}</TabPanel>
                  ))}
                </Box>
              </TabContext>
            </Panel>
            {(!isMobile && sideTabs.length > 0) && 
              <PanelResizeHandle>
                <Box sx={{ bgcolor: "primary.main", width: "8px", height: "100%" }} />
              </PanelResizeHandle>
            }
            {(!isMobile && sideTabs.length > 0) &&
              <Panel collapsible defaultSize={50} minSize={35} collapsedSize={0}>
                <TabContext value={sideTab}>
                  <Stack direction="row" sx={{ position: "sticky", top: 0, width: "100%", zIndex: 100, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <TabList 
                      variant="scrollable" 
                      textColor="inherit"
                      scrollButtons="auto"
                      allowScrollButtonsMobile 
                      TabIndicatorProps={{ style: { backgroundColor: '#fff' }}}
                      onChange={(event, newValue) => setSideTab(newValue)}
                    >
                      {Object.keys(ALL_TABS).filter(x => sideTabs.includes(x)).map((tab, index) => (
                        <TabWithMenu key={tab} value={tab} label={tab} onMove={() => setSideTabs(prev => prev.filter((x, i) => i !== index))} />
                      ))}
                    </TabList>
                  </Stack>
                  <Box sx={{ overflowY: 'auto', height: "100%" }}>
                    {Object.keys(ALL_TABS).map((tab, index) => (
                      <TabPanel sx={{ p: 0 }} key={tab} value={tab}>{ALL_TABS[tab]()}</TabPanel>
                    ))}
                  </Box>
                </TabContext>
              </Panel>
            }
          </PanelGroup>
        </SplitViewContext.Provider>
      </Box>
    </Box>
  )
}
