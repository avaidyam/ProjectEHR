// export default Allergies;
import React, { useState } from 'react';
import { Box, Button, Typography, Icon } from '@mui/material';
import dayjs from 'dayjs';
import AllergiesTable from './AllergiesTable.js';
import AllergyEditor from './AllergyEditor.js';
import AgentSearchMenu from './AgentSearchMenu.js';
import { blue, deepOrange,grey } from '@mui/material/colors';


const initialAllergies = [
  {
    id: 1,
    agent: 'Penicillin',
    type: 'Drug',
    reaction: 'Rash',
    severity: 'Moderate',
    reactionType: 'Immediate',
    onsetDate: '',
    notes: 'Avoid all penicillin-based antibiotics.',
  },
  {
    id: 2,
    agent: 'Peanuts',
    type: 'Food',
    reaction: 'Anaphylaxis',
    severity: 'High',
    reactionType: 'Immediate',
    onsetDate: '',
    notes: 'Carry epinephrine injector.',
  },
];

const Allergies = () => {
  const [allergies, setAllergies] = useState(initialAllergies);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);  // <--- selected from search, waiting to add
  const [lastReviewed, setLastReviewed] = useState(null);

  const handleEdit = (allergy) => {
    setEditingAllergy(allergy);
    setIsEditingMode(true);
  };

  const handleSaveAllergy = (newAllergyData) => {
    if (editingAllergy && editingAllergy.id) {
      setAllergies((prev) =>
        prev.map((allergy) =>
          allergy.id === editingAllergy.id
            ? { ...allergy, ...newAllergyData }
            : allergy
        )
      );
    } else {
      const newId = allergies.length > 0 ? Math.max(...allergies.map(a => a.id)) + 1 : 1;
      setAllergies((prev) => [
        ...prev,
        { id: newId, ...newAllergyData }
      ]);
    }
    setIsEditingMode(false);
    setEditingAllergy(null);
    setLastReviewed(null); // reset last reviewed date when saving new allergy

  };

  const handleDeleteAllergy = (id) => {
    setAllergies((prev) => prev.filter((allergy) => allergy.id !== id));
    if (editingAllergy?.id === id) {
      setIsEditingMode(false);
      setEditingAllergy(null);
      setLastReviewed(null);
    }
  };

  const handleAgentSelect = (agentObject) => {
    setSelectedAgent(agentObject);  // store selected agent, do NOT open editor yet
  };

  // On Add button click, open editor with selectedAgent (or empty if none selected)
  const handleAddClick = () => {
    if (selectedAgent) {
      setEditingAllergy({ ...selectedAgent, id: null });
    } else {
      setEditingAllergy({
        agent: '',
        allergenType: '',
        reaction: '',
        severity: '',
        reactionType: '',
        onsetDate: '',
        notes: '',
      });
    }
    setIsEditingMode(true);
    setSelectedAgent(null);  // clear selected agent after opening editor
    setLastReviewed(null); // reset last reviewed date when adding new allergy
  };

  const handleCancelEdit = () => {
    setIsEditingMode(false);
    setEditingAllergy(null);
  };
  const handleMarkAsReviewed = () => {
    const now = dayjs().format('MMM D, YYYY h:mm A');
    setLastReviewed(now);
  };

  return (
    <Box sx={{height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper'}}>
      <Box sx={{ bgcolor: 'grey.100',pt: 4, pb: 1, px:3, borderRadius: 1, mb: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' , color: blue[500]}}> 
        Allergies / Contraindications
      </Typography>

      <Box display="flex" alignItems="center" mb={2} gap={2} >
        <AgentSearchMenu onAgentSelect={handleAgentSelect} />
            <Button
              variant="outlined"
              startIcon={<Icon sx={{ color: 'green' }}>add_task</Icon>} 
              onClick={handleAddClick}>
              Add
            </Button>
      </Box>

      </Box>


      <Box sx={{flexGrow: 1, overflowY: 'auto',p:3, mb: 2}}>
        <AllergiesTable
          allergies={allergies}
          onEdit={handleEdit}
          onDelete={handleDeleteAllergy}
        />
        {isEditingMode && (
          <AllergyEditor
            initialData={editingAllergy}
            onSave={handleSaveAllergy}
            onCancel={handleCancelEdit}
          />
        )}
      </Box>

      <Box
          sx={{
          bgcolor: 'grey.100',
          borderTop: 1,
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'

        }}>
        <Button variant="outlined" onClick={handleMarkAsReviewed} sx={{
    color: grey[600],
    borderColor: grey[600],
    '&:hover': {
      borderColor: grey[600],
      backgroundColor: grey[300], // subtle hover effect
    },
  }}> Mark as Reviewed </Button>
        <Button variant="outlined" sx={{
    color: grey[600],
    borderColor: grey[600],
    '&:hover': {
      borderColor: grey[600],
      backgroundColor: grey[300], // subtle hover effect
    },
  }}>Unable to Assess</Button>
        <Typography variant="body2"sx={{color: lastReviewed ? 'green' : 'gray',fontStyle: 'italic'}}>
          {lastReviewed ? `Last Reviewed at ${lastReviewed}` : 'Not Reviewed'}
        </Typography>

            </Box>
    </Box>
  );
};

export default Allergies;



// import React, { useState } from 'react';
// import { Box, Button, Typography, Icon } from '@mui/material';
// import dayjs from 'dayjs';
// import AllergiesTable from './AllergiesTable.js';
// import AllergyEditor from './AllergyEditor.js';
// import AgentSearchMenu from './AgentSearchMenu.js';

// const Allergies = ({ patientData, setPatientData, encounterId }) => {
//   const allergies =
//     patientData.encounters?.find((x) => x.id === encounterId)?.allergies || [];

//   const [editingAllergy, setEditingAllergy] = useState(null);
//   const [isEditingMode, setIsEditingMode] = useState(false);
//   const [selectedAgent, setSelectedAgent] = useState(null);
//   const [lastReviewed, setLastReviewed] = useState(null);

//   const updateAllergiesInPatientData = (newAllergyList) => {
//     setPatientData((prevData) => {
//       const updatedEncounters = prevData.encounters.map((encounter) =>
//         encounter.id === encounterId
//           ? { ...encounter, allergies: newAllergyList }
//           : encounter
//       );
//       return { ...prevData, encounters: updatedEncounters };
//     });
//   };

//   const handleEdit = (allergy) => {
//     setEditingAllergy(allergy);
//     setIsEditingMode(true);
//   };

//   const handleSaveAllergy = (newAllergyData) => {
//     const isEditingExisting = editingAllergy && editingAllergy.id;
//     let updatedAllergies;

//     if (isEditingExisting) {
//       updatedAllergies = allergies.map((allergy) =>
//         allergy.id === editingAllergy.id
//           ? { ...allergy, ...newAllergyData }
//           : allergy
//       );
//     } else {
//       const newId = allergies.length > 0 ? Math.max(...allergies.map((a) => a.id)) + 1 : 1;
//       updatedAllergies = [...allergies, { id: newId, ...newAllergyData }];
//     }

//     updateAllergiesInPatientData(updatedAllergies);
//     setIsEditingMode(false);
//     setEditingAllergy(null);
//     setLastReviewed(null);
//   };

//   const handleDeleteAllergy = (id) => {
//     const updated = allergies.filter((a) => a.id !== id);
//     updateAllergiesInPatientData(updated);
//     if (editingAllergy?.id === id) {
//       setIsEditingMode(false);
//       setEditingAllergy(null);
//       setLastReviewed(null);
//     }
//   };

//   const handleAgentSelect = (agentObject) => {
//     setSelectedAgent(agentObject);
//   };

//   const handleAddClick = () => {
//     if (selectedAgent) {
//       setEditingAllergy({ ...selectedAgent, id: null });
//     } else {
//       setEditingAllergy({
//         agent: '',
//         allergenType: '',
//         reaction: '',
//         severity: '',
//         reactionType: '',
//         onsetDate: '',
//         notes: '',
//       });
//     }
//     setIsEditingMode(true);
//     setSelectedAgent(null);
//     setLastReviewed(null);
//   };

//   const handleCancelEdit = () => {
//     setIsEditingMode(false);
//     setEditingAllergy(null);
//   };

//   const handleMarkAsReviewed = () => {
//     const now = dayjs().format('MMM D, YYYY h:mm A');
//     setLastReviewed(now);
//   };

//   return (
//     <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'background.paper' }}>
//       <Typography variant="h5" sx={{ mb: 2 }}>
//         Allergies / Contraindications
//       </Typography>

//       <Box display="flex" alignItems="center" mb={2} gap={2}>
//         <AgentSearchMenu onAgentSelect={handleAgentSelect} />
//         <Button
//           variant="outlined"
//           startIcon={<Icon sx={{ color: 'green' }}>add_task</Icon>}
//           onClick={handleAddClick}
//         >
//           Add
//         </Button>
//       </Box>

//       <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
//         <AllergiesTable
//           allergies={allergies}
//           onEdit={handleEdit}
//           onDelete={handleDeleteAllergy}
//         />
//         {isEditingMode && (
//           <AllergyEditor
//             initialData={editingAllergy}
//             onSave={handleSaveAllergy}
//             onCancel={handleCancelEdit}
//           />
//         )}
//       </Box>

//       <Box
//         sx={{
//           borderTop: 1,
//           borderColor: 'divider',
//           pt: 1,
//           display: 'flex',
//           justifyContent: 'flex-start',
//           alignItems: 'center',
//           gap: 2,
//           flexWrap: 'wrap',
//         }}
//       >
//         <Button variant="outlined" onClick={handleMarkAsReviewed}>
//           Mark as Reviewed
//         </Button>
//         <Button variant="outlined">Unable to Assess</Button>
//         <Typography
//           variant="body2"
//           sx={{
//             color: lastReviewed ? 'green' : 'gray',
//             fontStyle: 'italic',
//           }}
//         >
//           {lastReviewed ? `Last Reviewed at ${lastReviewed}` : 'Not Reviewed'}
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// export default Allergies;
