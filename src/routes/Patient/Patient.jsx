import React, { useState } from 'react'
import { Box, Drawer, IconButton, useTheme, useMediaQuery } from '@mui/material'
import { Icon } from 'components/ui/Core.jsx';
import { SplitView } from 'components/ui/SplitView.jsx';
import { PatientProvider, usePatientMRN, useEncounterID } from 'components/contexts/PatientContext.jsx';
import DiagnosesSearchModal from 'components/ui/diagnosis-modal/Modal.jsx';

import { Storyboard } from './components/Storyboard.jsx'
import { ChartReview } from './routes/ChartReview/ChartReview.jsx'
import ProblemListTabContent from './routes/ProblemList/ProblemList.jsx'
import SnapshotTabContent from './routes/Snapshot/Snapshot.jsx'
import NotesTabContent from './routes/NoteWriter/NoteWriter.jsx'
import HistoryTabContent from './routes/History/History.jsx'
import { OrderCart } from './routes/OrderCart/OrderCart.jsx';
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
import ClinicalImpressions from './routes/ClinicalImpressions/ClinicalImpressions.jsx';
import Handoff from './routes/Handoff/Handoff.jsx';
import Demographics from './routes/Demographics/Demographics.jsx';
import BottomBar from './components/BottomBar.jsx';
import { Flowsheet } from './routes/Flowsheet/Flowsheet';

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
  "Lab Report": (props) => <LabReport {...props} />,
  "Imaging Viewer": (props) => <ImagingViewer {...props} />,
  "Note": (props) => <NoteViewer {...props} />,
  "Flowsheet": (props) => <Flowsheet {...props} />,
}

const DEFAULT_MAIN_TABS = [
  { "SnapShot": {} }, { "Chart Review": {} }, { "Problem List": {} },
  { "History": {} }, { "Medications": {} }, { "Orders Mgmt": {} },
  { "NoteWriter": {} }, { "Results Review": {} }, { "Immunizations": {} },
  { "Allergies": {} }, { "Demographics": {} }, { "PDMP": {} }, 
  { "Flowsheet": {} }
]

const DEFAULT_SIDE_TABS = [
  { "Orders": {} }, { "Clinical Impressions": {} }, { "Chat": {} }, { "Handoff": {} }, 
]

export const Patient = ({ ...props }) => {
  const [enc] = useEncounterID();
  const [patientMRN] = usePatientMRN();

  const drawerWidth = 250
  const [storyboardOpen, setStoryboardOpen] = useState(true)
  const [isDxModalOpen, setIsDxModalOpen] = useState(false)
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

  return (
    <PatientProvider patient={patientMRN} encounter={enc}>
      <Box display="flex" direction="row" sx={{ overflowY: 'hidden', ...props.sx }} {...props}>
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
          <Storyboard />
        </Drawer>
        <Box sx={{ flexGrow: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'hidden' }}>
            <SplitView
              defaultMainTabs={DEFAULT_MAIN_TABS}
              defaultSideTabs={DEFAULT_SIDE_TABS}
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
          <BottomBar
            onAddOrder={() => console.log('Add order clicked')}
            onAddDx={() => setIsDxModalOpen(true)}
            onSignEncounter={() => console.log('Sign encounter clicked')}
          />
        </Box>
      </Box>

      {/* Diagnosis Search Modal */}
      <DiagnosesSearchModal
        open={isDxModalOpen}
        onClose={() => setIsDxModalOpen(false)}
      />
    </PatientProvider>
  )
}
