import React, { useState } from 'react'
import { ErrorBoundary } from "react-error-boundary";
import { Box, Drawer, IconButton, useTheme, useMediaQuery, Button } from '@mui/material'
import { Icon } from 'components/ui/Core.jsx';
import { SplitView } from 'components/ui/SplitView.jsx';
import { PatientProvider, usePatientMRN, useEncounterID } from 'components/contexts/PatientContext.jsx';

import { Storyboard } from './components/Storyboard.jsx'
import { ChartReview } from './routes/ChartReview/ChartReview.jsx'
import ProblemListTabContent from './routes/ProblemList/ProblemList.jsx'
import SnapshotTabContent from './routes/Snapshot/Snapshot.jsx'
import NotesTabContent from './routes/NoteWriter/NoteWriter.jsx'
import HistoryTabContent from './routes/History/History.jsx'
import { OrderCart } from './routes/OrderCart/OrderCart.jsx';
import { OrderPicker } from './routes/OrderCart/components/OrderPicker.jsx';
import { DiagnosisPicker } from './routes/ProblemList/components/DiagnosisPicker.jsx';
import OrdersMgmt from './routes/OrdersManagement/OrdersManagement.jsx';
import Medications from './routes/Medications/Medications.jsx';
import ResultsReview from "./routes/Results/Results.jsx";
import Pdmp from './routes/PDMP/PDMP.jsx';
import Immunizations from './routes/Immunizations/Immunizations.jsx';
import { Allergies } from './routes/Allergies/Allergies.jsx';
import Chat from "./routes/Chat/Chat.jsx";
import ReportViewer from './routes/ReportViewer/ReportViewer.jsx';
import { ImagingViewer } from './routes/ImagingViewer/ImagingViewer.jsx';
import NoteViewer from './routes/NoteViewer/NoteViewer.jsx';
import NotesList from './routes/NotesList/NotesList.jsx';
import ClinicalImpressions from './routes/ClinicalImpressions/ClinicalImpressions.jsx';
import Handoff from './routes/Handoff/Handoff.jsx';
import Demographics from './routes/Demographics/Demographics.jsx';
import { EncounterAlert } from './components/EncounterAlert.jsx'
import { Flowsheet } from './routes/Flowsheet/Flowsheet';
import EditNote from './routes/EditNote/EditNote.jsx';
import { AppointmentDesk } from './routes/AppointmentDesk/AppointmentDesk.jsx';
import { EditResult } from './routes/EditResult/EditResult.jsx';
import { EventLog } from './routes/EventLog/EventLog.jsx';
import MAR from './routes/MAR/MAR.jsx';

const ALL_TABS = {
  "SnapShot": (props) => <SnapshotTabContent {...props} />,
  "Chart Review": (props) => <ChartReview {...props} />,
  "Problem List": (props) => <ProblemListTabContent {...props} />,
  "History": (props) => <HistoryTabContent {...props} />,
  "Medications": (props) => <Medications {...props} />,
  "Orders": (props) => <OrderCart {...props} />,
  "Orders Mgmt": (props) => <OrdersMgmt {...props} />,
  "NoteWriter": (props) => <NotesTabContent {...props} />,
  "Results Review": (props) => <ResultsReview {...props} />,
  "PDMP": (props) => <Pdmp {...props} />,
  "Immunizations": (props) => <Immunizations {...props} />,
  "Clinical Impressions": (props) => <ClinicalImpressions {...props} />,
  "Handoff": (props) => <Handoff {...props} />,
  "Allergies": (props) => <Allergies {...props} />,
  "Demographics": (props) => <Demographics {...props} />,
  "Chat": (props) => <Chat {...props} />,
  "Report": (props) => <ReportViewer {...props} />,
  "Imaging Viewer": (props) => <ImagingViewer {...props} />,
  "Note": (props) => <NoteViewer {...props} />,
  "Notes": (props) => <NotesList {...props} />,
  "Flowsheet": (props) => <Flowsheet {...props} />,
  "Edit Note": (props) => <EditNote {...props} />,
  "Appointment Desk": (props) => <AppointmentDesk {...props} />,
  "Edit Result": (props) => <EditResult {...props} />,
  "Event Log": (props) => <EventLog {...props} />,
  "MAR": (props) => <MAR {...props} />,
}

const DEFAULT_MAIN_TABS = [
  { "SnapShot": {} }, { "Chart Review": {} }, { "Problem List": {} },
  { "History": {} }, { "Medications": {} }, { "Orders Mgmt": {} },
  { "Results Review": {} },
]

const OVERFLOW_MENU_TABS = [
  { "Immunizations": {} }, { "Allergies": {} }, { "Demographics": {} },
  { "PDMP": {} }, { "Flowsheet": {} }, { "Appointment Desk": {} },
  { "Event Log": {} }, { "MAR": {} }, { "Notes": {} }
]

const DEFAULT_SIDE_TABS = [
  { "Orders": {} }, { "Clinical Impressions": {} }, { "Chat": {} }, { "Handoff": {} },
]

export const Patient = ({ ...props }) => {
  const [enc] = useEncounterID();
  const [patientMRN] = usePatientMRN();

  const drawerWidth = 250
  const [storyboardOpen, setStoryboardOpen] = useState(true)
  const [isOrderPickerOpen, setIsOrderPickerOpen] = useState(false)
  const [isDiagnosisPickerOpen, setIsDiagnosisPickerOpen] = useState(false)
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

  return (
    <PatientProvider patient={patientMRN} encounter={enc}>
      <Box display="flex" direction="row" sx={{ overflowY: 'hidden', height: 'calc(100vh - 48px)', ...props.sx }} {...props}>
        <Drawer
          variant={isMobile ? "temporary" : "persistent"}
          anchor="left"
          open={!isMobile || storyboardOpen}
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
          <ErrorBoundary fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>⚠️ Something went wrong</Box>}>
            <Storyboard />
          </ErrorBoundary>
        </Drawer>
        <Box sx={{ flexGrow: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'hidden' }}>
            <SplitView
              defaultMainTabs={DEFAULT_MAIN_TABS}
              defaultSideTabs={DEFAULT_SIDE_TABS}
              overflowMenuTabs={OVERFLOW_MENU_TABS}
              tabsDirectory={ALL_TABS}
              accessories={
                <IconButton
                  color="inherit"
                  onClick={() => setStoryboardOpen(!storyboardOpen)}
                  edge="start"
                  sx={[{ ml: 1 }, !isMobile && { display: 'none' }]}
                >
                  <Icon>menu</Icon>
                </IconButton>
              } />
          </Box>
          <Box
            sx={{
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={2}
              py={1}
            >
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Icon>add</Icon>}
                  onClick={() => setIsOrderPickerOpen(true)}
                >
                  Add order
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon>add</Icon>}
                  onClick={() => setIsDiagnosisPickerOpen(true)}
                >
                  Add Dx
                </Button>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Icon>check_circle</Icon>}
                  disabled
                  onClick={() => console.log('Sign encounter clicked')}
                >
                  Sign encounter
                </Button>
              </Box>
            </Box>
          </Box>
          <EncounterAlert />
        </Box>
      </Box>
      <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
        <OrderPicker
          open={isOrderPickerOpen}
          onSelect={() => setIsOrderPickerOpen(false)}
        />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
        <DiagnosisPicker
          open={isDiagnosisPickerOpen}
          onSelect={() => setIsDiagnosisPickerOpen(false)}
        />
      </ErrorBoundary>
    </PatientProvider>
  )
}
