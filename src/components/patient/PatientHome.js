import React, { useState } from 'react'
import { Box, Tab, Tabs, Divider, Toolbar, Typography, Avatar, Fade, Paper, Popper, TextField } from '@mui/material'
import {EditorState} from 'draft-js'; // Modifier, ContentState (Maybe)

import { Storyboard } from './Storyboard.js'
import { ChartReview } from './tabs/chartreview/ChartReviewTabContent.js'
import PreChartingTabContent from './tabs/snapshot/PreChartingTabContent.js'
import ProblemListTabContent from './tabs/problemlist/ProblemListTabContent.js'
import SnapshotTabContent from './tabs/snapshot/SnapshotTabContent.js'
import NotesTabContent from './tabs/notewriter/NotesTabContent.js'
import { HistoryTabContent } from './tabs/history/HistoryTabContent.js'
import Orders from './tabs/orders/Orders.js';
import Medications from './tabs/medications/Medications.js';

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
          <Tab label="NoteWriter" />
        </Tabs>
        <Divider />
        {tab === 0 && <SnapshotTabContent />}
        {tab === 1 && <ChartReview />}
        {tab === 2 && <ProblemListTabContent />}
        {tab === 3 && <HistoryTabContent />}
        {tab === 4 && <Medications />}
        {tab === 5 && <Orders />}
        {tab === 6 && <NotesTabContent 
          editorState={editorState}
          setEditorState={setEditorState}
          rosState={rosState} 
          setRosState={setRosState}
          bodySystems={bodySystems}
          // Want to have ROS & Editor State Here as want it preserved as user is going thru the chart to fill in details (do
          // not want it to reset each time user switches tabs. This may change down the line, but for now, this is the plan)
         />}
      </Box>
    </Box>
  )
}
