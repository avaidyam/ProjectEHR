import React, { useState } from 'react'
import { Box, Tab, Tabs, Divider,  Paper} from '@mui/material'
import {EditorState} from 'draft-js'; // Modifier, ContentState (Maybe)

import { Storyboard } from './Storyboard.js'
import { ChartReview } from './tabs/chartreview/ChartReviewTabContent.js'
import PreChartingTabContent from './tabs/snapshot/PreChartingTabContent.js'
import ProblemListTabContent from './tabs/problemlist/ProblemListTabContent.js'
import SnapshotTabContent from './tabs/snapshot/SnapshotTabContent.js'
import NotesTabContent from './tabs/notewriter/NotesTabContent.js'
import { HistoryTabContent } from './tabs/history/HistoryTabContent.js'
import Orders from './tabs/orders/Orders.js';
import OrdersMgmt from './tabs/orders/OrdersMgmt.js';
import Medications from './tabs/medications/Medications.js';
import ResultsReview from "./tabs/resultsreview/ResultsReview";
import Pdmp from './tabs/pdmp/Pdmp.js';


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
  const drawerWidth = 250
  const [tab, setTab] = useState(0)

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

  return (
    <Box display="flex" direction="row" {...props}>
      <Paper square elevation={8} sx={{ width: drawerWidth, height: '100vh', overflow: 'auto', flexShrink: 0, flexGrow: 0, backgroundColor: 'primary.main', color: 'primary.contrastText', p: 1 }}>
          <Storyboard /> 
      </Paper>
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Tabs value={tab} onChange={(event, newValue) => setTab(newValue)}>
          <Tab label="SnapShot" />
          <Tab label="Chart Review" />
          <Tab label="Problem List" />
          <Tab label="History" />
          <Tab label="Medications" />
          <Tab label="Orders" />
          <Tab label="Orders Mgmt" />
          <Tab label="NoteWriter" />
          <Tab label="PDMP" />
          <Tab label="Results Review" />
        </Tabs>
        <Divider />
        {tab === 0 && <SnapshotTabContent />}
        {tab === 1 && <ChartReview />}
        {tab === 2 && <ProblemListTabContent />}
        {tab === 3 && <HistoryTabContent />}
        {tab === 4 && <Medications />}
        {tab === 5 && <Orders />}
        {tab === 6 && <OrdersMgmt/>}
        {tab === 7 && <NotesTabContent 
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
         />}
         {tab === 8 && <Pdmp/>}
         {tab === 9 && <ResultsReview/>}
      </Box>
    </Box>
  )
}
