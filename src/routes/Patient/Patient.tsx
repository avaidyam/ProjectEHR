import * as React from 'react'
import { ErrorBoundary } from "react-error-boundary";
import { Box, Drawer, IconButton, useTheme, useMediaQuery, Button } from '@mui/material'
import { Icon } from 'components/ui/Core';
import { SplitView } from 'components/ui/SplitView';
import { PatientProvider, usePatientMRN, useEncounterID } from 'components/contexts/PatientContext';

import { Storyboard } from './routes/Storyboard/Storyboard'
import { ChartReview } from './routes/ChartReview/ChartReview'
import { ProblemListTabContent } from './routes/ProblemList/ProblemList'
import { SnapshotTabContent } from './routes/Snapshot/Snapshot'
import { NoteWriter } from './routes/NoteWriter/NoteWriter'
import { HistoryTabContent } from './routes/History/History'
import { OrderCart } from './routes/OrderCart/OrderCart';
import { OrderPicker } from './routes/OrderCart/components/OrderPicker';
import { DiagnosisPicker } from './routes/ProblemList/components/DiagnosisPicker';
import { OrdersMgmt } from './routes/OrdersManagement/OrdersManagement';
import { Medications } from './routes/Medications/Medications';
import { ResultsReview } from "./routes/Results/Results";
import { Pdmp } from './routes/PDMP/PDMP';
import { Immunizations } from './routes/Immunizations/Immunizations';
import { Allergies } from './routes/Allergies/Allergies';
import { Chat } from "./routes/Chat/Chat";
import { ReportViewer } from './routes/ReportViewer/ReportViewer';
import { ImagingViewer } from './routes/ImagingViewer/ImagingViewer';
import { NoteViewer } from './routes/NoteViewer/NoteViewer';
import { NotesList } from './routes/NotesList/NotesList';
import { ClinicalImpressions } from './routes/ClinicalImpressions/ClinicalImpressions';
import { Handoff } from './routes/Handoff/Handoff';
import { Demographics } from './routes/Demographics/Demographics';
import { EncounterAlert } from './components/EncounterAlert'
import { Flowsheet } from './routes/Flowsheet/Flowsheet';
import { EditNote } from './routes/EditNote/EditNote';
import { AppointmentDesk } from './routes/AppointmentDesk/AppointmentDesk';
import { EditResult } from './routes/EditResult/EditResult';
import { EventLog } from './routes/EventLog/EventLog';
import { MAR } from './routes/MAR/MAR';

const ALL_TABS: Record<string, (props: any) => React.ReactNode> = {
  "SnapShot": (props: any) => <SnapshotTabContent {...props} />,
  "Chart Review": (props: any) => <ChartReview {...props} />,
  "Problem List": (props: any) => <ProblemListTabContent {...props} />,
  "History": (props: any) => <HistoryTabContent {...props} />,
  "Medications": (props: any) => <Medications {...props} />,
  "Orders": (props: any) => <OrderCart {...props} />,
  "Orders Mgmt": (props: any) => <OrdersMgmt {...props} />,
  "NoteWriter": (props: any) => <NoteWriter {...props} />,
  "Results Review": (props: any) => <ResultsReview {...props} />,
  "PDMP": (props: any) => <Pdmp {...props} />,
  "Immunizations": (props: any) => <Immunizations {...props} />,
  "Clinical Impressions": (props: any) => <ClinicalImpressions {...props} />,
  "Handoff": (props: any) => <Handoff {...props} />,
  "Allergies": (props: any) => <Allergies {...props} />,
  "Demographics": (props: any) => <Demographics {...props} />,
  "Chat": (props: any) => <Chat {...props} />,
  "Report": (props: any) => <ReportViewer {...props} />,
  "Imaging Viewer": (props: any) => <ImagingViewer {...props} />,
  "Note": (props: any) => <NoteViewer {...props} />,
  "Notes": (props: any) => <NotesList {...props} />,
  "Flowsheet": (props: any) => <Flowsheet {...props} />,
  "Edit Note": (props: any) => <EditNote {...props} />,
  "Appointment Desk": (props: any) => <AppointmentDesk {...props} />,
  "Edit Result": (props: any) => <EditResult {...props} />,
  "Event Log": (props: any) => <EventLog {...props} />,
  "MAR": (props: any) => <MAR {...props} />,
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

export const Patient = ({ ...props }: any) => {
  const [enc] = useEncounterID();
  const [patientMRN] = usePatientMRN();

  const drawerWidth = 250
  const [storyboardOpen, setStoryboardOpen] = React.useState(true)
  const [isOrderPickerOpen, setIsOrderPickerOpen] = React.useState(false)
  const [isDiagnosisPickerOpen, setIsDiagnosisPickerOpen] = React.useState(false)
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
          searchTerm=""
          open={isOrderPickerOpen}
          onSelect={() => setIsOrderPickerOpen(false)}
        />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
        <DiagnosisPicker
          searchTerm=""
          open={isDiagnosisPickerOpen}
          onSelect={() => setIsDiagnosisPickerOpen(false)}
        />
      </ErrorBoundary>
    </PatientProvider>
  )
}
