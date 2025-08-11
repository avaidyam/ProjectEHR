import React, { useState, useEffect } from 'react';
import { Box, Chip } from '@mui/material';
import {EditorState} from 'draft-js'; // Modifier, ContentState (Maybe)

import { usePatientMRN, useEncounterID } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';

import NoteWriterHPI from './components/NoteWriterHPI.jsx';
import NoteWriterROS from './components/NoteWriterROS.jsx';
import NoteWriterPE from './components/NoteWriterPE.jsx';

const tabLabels = [
  "HPI",
  "ROS",
  "Physical Exam"
];

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

const temporaryStorage = {};

export const Notewriter = () => {
  const [enc] = useEncounterID();
  const [patientMRN] = usePatientMRN();
  const [patientData, setPatientData] = useState(TEST_PATIENT_INFO({ patientMRN }));

  const [selectedTabIndex, setSelectedTabIndex] = useState(0); // Zero is Index of the first tab (HPI)
  const [selectedTabLabel, setSelectedTabLabel] = useState('HPI');

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
  
  const [editorState, setEditorState] = [(temporaryStorage[patientMRN]?.[enc]?.editorState), (x) => { temporaryStorage[patientMRN][enc].editorState = x }]
  const [peState, setPEState] = [(temporaryStorage[patientMRN]?.[enc]?.peState), (x) => { temporaryStorage[patientMRN][enc].peState = x }]
  const [rosState, setRosState] = [(temporaryStorage[patientMRN]?.[enc]?.rosState), (x) => { temporaryStorage[patientMRN][enc].rosState = x }]

  //const [editorState, setEditorState] = useState(() => (temporaryStorage.patientMRN?.enc?.editorState) ?? EditorState.createEmpty());
  //const [peState, setPEState] = useState(temporaryStorage.patientMRN?.enc?.peState ?? generateInitialPEState(physicalExamBodySystems));
  //const [rosState, setRosState] = useState(temporaryStorage.patientMRN?.enc?.rosState ?? generateInitialRosState(bodySystems));
  
  useEffect(() => {
    if(temporaryStorage.patientMRN?.enc === undefined) {
      temporaryStorage[patientMRN] = {
        [enc]: {
          editorState: EditorState.createEmpty(),
          peState: generateInitialPEState(physicalExamBodySystems),
          rosState: generateInitialRosState(bodySystems)
        }
      }
    }
  }, []);

  const handleTabChange = (newTab, idx) => {
    setSelectedTabLabel(newTab);
    setSelectedTabIndex(idx);
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {tabLabels.map((label, idx) => (
          <Chip
            key={idx}
            label={label}
            onClick={() => handleTabChange(label, idx)}
            variant={selectedTabIndex === idx ? "filled" : "outlined"}
            color={selectedTabIndex === idx ? "primary" : "default"}
            style={{ margin: 5 }}
          />
        ))}
      </Box>
      {selectedTabLabel === 'HPI' && (
        <NoteWriterHPI editorState={editorState} setEditorState={setEditorState} />
      )}
      {selectedTabLabel === 'ROS' && (
        <NoteWriterROS 
          editorState={editorState} setEditorState={setEditorState}
          rosState={rosState} setRosState={setRosState} bodySystems={bodySystems} />
      )}
      {selectedTabLabel === 'Physical Exam' && (
        <NoteWriterPE 
          editorState={editorState} setEditorState={setEditorState}
          peState={peState} setPEState={setPEState} bodySystemsPE={physicalExamBodySystems}/>
      )}
    </div>
  );
};
export default Notewriter;
