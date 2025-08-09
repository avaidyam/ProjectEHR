import React, { useState } from 'react'
import { AppBar, Box, Tab, Tabs, Divider, Drawer, Stack, IconButton} from '@mui/material'
import { Menu } from '@mui/icons-material'
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {EditorState} from 'draft-js'; // Modifier, ContentState (Maybe)

import { Storyboard } from './components/Storyboard.js'
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
import Allergies from './routes/Allergies/Allergies.jsx';
import { usePatientMRN, useEncounterID } from '../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../util/data/PatientSample.js';

const bodySystems = [
  {
    title: 'Constitutional',
    symptoms: ['Fever', 'Chills', 'Weight loss', 'Malaise/Fatigue', 'Diaphoresis'],
  },
  {
    title: 'Skin',
    symptoms: ['Rash', 'Itching'],
  },
  {
    title: 'HENT',
    symptoms: [
      'Hearing loss',
      'Tinnitus',
      'Ear pain',
      'Ear discharge',
      'Nosebleeds',
      'Congestion',
      'Sinus pain',
      'Stridor',
      'Sore throat',
    ],
  },
  {
    title: 'Eyes',
    symptoms: [
      'Blurred vision',
      'Double vision',
      'Photophobia',
      'Eye pain',
      'Eye discharge',
      'Eye redness',
    ],
  },
  {
    title: 'Cardiovascular',
    symptoms: [
      'Chest pain',
      'Palpitations',
      'Orthopnea',
      'Claudication',
      'Leg swelling',
      'PND',
    ],
  },
  {
    title: 'Respiratory',
    symptoms: [
      'Cough',
      'Hemoptysis',
      'Sputum production',
      'Shortness of breath',
      'Wheezing',
    ],
  },
  {
    title: 'GI',
    symptoms: [
      'Heartburn',
      'Nausea',
      'Vomiting',
      'Abdominal pain',
      'Diarrhea',
      'Constipation',
      'Blood in stool',
      'Melena',
    ],
  },
  {
    title: 'GU',
    symptoms: [
      'Dysuria',
      'Urgency',
      'Frequency',
      'Hematuria',
      'Flank pain',
    ],
  },
  {
    title: 'Musculoskeletal',
    symptoms: [
      'Myalgias',
      'Neck pain',
      'Back pain',
      'Joint pain',
      'Falls',
    ],
  },
  {
    title: 'Endo/Heme/Allergy',
    symptoms: [
      'Easy bruising/bleeding',
      'Environmental allergies',
      'Polydipsia',
    ],
  },
  {
    title: 'Neurological',
    symptoms: [
      'Dizziness',
      'Headaches',
      'Tingling',
      'Tremor',
      'Sensory change',
      'Speech change',
      'Focal weakness',
      'Weakness',
      'Seizures',
      'LOC',
    ],
  },
  {
    title: 'Psychiatric',
    symptoms: [
      'Depression',
      'Suicidal ideas',
      'Substance abuse',
      'Hallucinations',
      'Nervous/Anxious',
      'Insomnia',
      'Memory loss',
    ],
  },
];

const physicalExamBodySystems = [
  {
    title: 'Constitutional',
    subsections: [
      {
        // subsectionTitle: 'General', 
        checkboxes: ['Alert', 'Normal Weight', 'Normal Appearance', 'Obese'], 
        symptoms: ['Acute Distress', 'Ill-Appearing', 'Toxic Appearing', 'Diaphoretic'], 
      }, 
    ],
  },
  { 
    title: 'Neck', 
    subsections: [ 
      { 
        checkboxes: ['ROM Normal', 'Supple'], 
        symptoms: ['Neck Rigidity', 'Tenderness', 'Cervical Adenopathy', 'Carotid Bruit'], 
      }, 
    ],
  },
  {
    title: 'Skin',
    subsections: [
      {
        checkboxes: ['Warm', 'Dry', 'Normal Color'],
        symptoms: ['Rash', 'Erythema', 'Pallor', 'Cyanosis'],
      },
    ],
  },
  {
    title: 'Respiratory',
    subsections: [
      {
        subsectionTitle: 'Breath Sounds',
        checkboxes: ['Clear to Auscultation Bilaterally'],
        symptoms: ['Wheezes', 'Rales', 'Rhonchi'],
      },
      {
        subsectionTitle: 'Respiratory Effort',
        checkboxes: ['Normal Effort', 'No Accessory Muscle Use'],
        symptoms: ['Labored Breathing', 'Retractions'],
      },
    ],
  },
  {
    title: 'Genitourinary / Anorectal',
    subsections: [
      {
        subsectionTitle: 'General',
        checkboxes: ['Normal External Appearance'],
        symptoms: ['Lesions', 'Discharge'],
      },
      {
        subsectionTitle: 'Anorectal',
        checkboxes: ['Normal Tone'],
        symptoms: ['Hemorrhoids', 'Fissures'],
      },
    ],
  },
  {
    title: 'Musculoskeletal',
    subsections: [
      {
        subsectionTitle: 'General',
        checkboxes: ['Full Range of Motion', 'No Deformity'],
        symptoms: ['Tenderness', 'Swelling', 'Limited ROM'],
      },
      {
        subsectionTitle: 'Spine',
        checkboxes: ['Normal Curvature'],
        symptoms: ['Tenderness', 'Kyphosis', 'Scoliosis'],
      },
    ],
  },
  {
    title: 'Neurological',
    subsections: [
      {
        subsectionTitle: 'Mental Status',
        checkboxes: ['Alert', 'Oriented x3'],
        symptoms: ['Confusion', 'Lethargy'],
      },
      {
        subsectionTitle: 'Motor Function',
        checkboxes: ['Normal Strength'],
        symptoms: ['Weakness', 'Tremor', 'Involuntary Movements'],
      },
      {
        subsectionTitle: 'Reflexes',
        checkboxes: ['Normal Reflexes'],
        symptoms: ['Hyperreflexia', 'Hyporeflexia'],
      },
    ],
  },
  {
    title: 'Psychiatric',
    subsections: [
      {
        subsectionTitle: 'Affect',
        checkboxes: ['Normal Affect'],
        symptoms: ['Flat', 'Anxious', 'Depressed'],
      },
      {
        subsectionTitle: 'Behavior',
        checkboxes: ['Cooperative'],
        symptoms: ['Agitated', 'Withdrawn'],
      },
    ],
  },
  {
    title: 'Gastrointestinal',
    subsections: [
      {
        subsectionTitle: 'Inspection',
        checkboxes: ['Non-Distended'],
        symptoms: ['Scars', 'Striae'],
      },
      {
        subsectionTitle: 'Palpation',
        checkboxes: ['Soft', 'Non-Tender'],
        symptoms: ['Tenderness', 'Guarding', 'Rebound'],
      },
      {
        subsectionTitle: 'Bowel Sounds',
        checkboxes: ['Normal Bowel Sounds'],
        symptoms: ['Hyperactive', 'Hypoactive', 'Absent'],
      },
    ],
  },
  {
    title: 'HEENT',
    subsections: [
      {
        subsectionTitle: 'Head',
        checkboxes: ['Normocephalic', 'Atraumatic'],
        symptoms: [],
      },
      {
        subsectionTitle: 'Eyes',
        checkboxes: ['PERRL', 'EOM Intact'],
        symptoms: ['Conjunctivae Normal', 'Scleral Icterus'],
      },
      {
        subsectionTitle: 'Ears (Right)',
        checkboxes: ['TM Normal', 'Canal Normal', 'External Ear Normal'],
        symptoms: ['Impacted Cerumen'],
      },
      {
        subsectionTitle: 'Ears (Left)',
        checkboxes: ['TM Normal', 'Canal Normal', 'External Ear Normal'], 
        symptoms: ['Impacted Cerumen'], 
      }, 
      { 
        subsectionTitle: 'Nose', 
        checkboxes: ['Nose Normal'], 
        symptoms: ['Congestion', 'Rhinorrhea'], 
      }, 
      { 
        subsectionTitle: 'Mouth/Throat', 
        checkboxes: ['Moist'], 
        symptoms: ['Clear', 'Exudate', 'Erythema'], 
      }, 
    ], 
  },
  {
    title: 'Cardiovascular',
    subsections: [
      {
        subsectionTitle: 'Rate',
        checkboxes: ['Normal Rate', 'Tachycardia', 'Bradycardia'],
        symptoms: []
      },
      {
        subsectionTitle: 'Rhythm',
        checkboxes: ['Regular Rhythm', 'Irregular Rhythm'],
        symptoms: []
      },
      {
        subsectionTitle: 'Pulses and Heart Sounds',
        checkboxes: ['Pulses Normal', 'Heart Sounds Normal'],
        symptoms: ['Murmur', 'Friction Rub', 'Gallop']
      },
    ],
  },

];


export const PatientHome = ({ ...props }) => {
  const [enc] = useEncounterID();

  const drawerWidth = 250
  const [tab, setTab] = useState("1")
  const [storyboardOpen, setStoryboardOpen] = useState(true)

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const generateInitialRosState = (systems) => {
    const initialState = {};
  
    systems.forEach(system => {
      const systemState = {};
      system.symptoms.forEach(symptom => {
        systemState[symptom] = null; // Initial state for each symptom is `null`
      });
      systemState['custom'] = null; // Add a custom entry for custom ROS text (DescriptionIcon)
      initialState[system.title.toLowerCase()] = systemState;
    });
  
    return initialState;
  };

  const generateInitialPEState = (systems) => {
    // We need a separate function to generate the initial state for the physical exam because it has subsections
    const initialState = {};
  
    systems.forEach(system => {
      const systemState = {};
      system.subsections.forEach((subsection, idx) => {
        const subsectionTitle = subsection.subsectionTitle ? subsection.subsectionTitle.toLowerCase() : '';
        systemState[subsectionTitle] = {symptoms: null, checkboxes: null}; // Initial state for each subsection is null
      });
      initialState[system.title.toLowerCase()] = systemState;
      systemState['custom'] = null; // Add a custom entry for custom PE text (DescriptionIcon)
    });
  
    return initialState;
  };
  
  
  const [peState, setPEState] = useState(generateInitialPEState(physicalExamBodySystems));
  const [rosState, setRosState] = useState(generateInitialRosState(bodySystems));
  const [patientMRN] = usePatientMRN();
  const [patientData, setPatientData] = useState(TEST_PATIENT_INFO({ patientMRN }));
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
              <Menu />
            </IconButton>
            <TabList 
              variant="scrollable" 
              textColor="inherit"
              scrollButtons 
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
            <TabPanel sx={{ p: 0 }} value="8">
              <NotesTabContent 
                editorState={editorState}
                setEditorState={setEditorState}
                rosState={rosState} 
                setRosState={setRosState}
                peState={peState} 
                setPEState={setPEState}
                bodySystems={bodySystems}
                bodySystemsPE={physicalExamBodySystems}
                // Want to have ROS & Editor State Here as want it preserved as user is going thru the chart to fill in details (do
                // not want it to reset each time user switches tabs. This may change down the line, but for now, this is the plan)
              />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value="9"><ResultsReview/></TabPanel>
            <TabPanel sx={{ p: 0 }} value="10"><Pdmp/></TabPanel>
            <TabPanel sx={{ p: 0 }} value="11"><Immunizations/></TabPanel>
            <TabPanel sx={{ p: 0 }} value="12"><Allergies
                patientData={patientData}
                setPatientData={setPatientData}
                encounterId={enc}
              /></TabPanel>
          </Box>
        </TabContext>
      </Box>
    </Box>
  )
}
