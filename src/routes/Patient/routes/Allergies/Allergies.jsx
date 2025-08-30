// export default Allergies;
import React, { useState } from 'react';
import { Box, Button, Typography, Icon, colors } from '@mui/material';
import dayjs from 'dayjs';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import AllergiesTable from './components/AllergiesTable.jsx';
import AllergyEditor from './components/AllergyEditor.jsx';
import AgentSearchMenu from './components/AgentSearchMenu.jsx';
import { Snackbar, Alert } from '@mui/material';
import { id } from 'date-fns/locale';

// const initialAllergies = [
//   {
//     id: 1,
//     allergen: 'Penicillin',
//     type: 'Drug',
//     reaction: 'Rash',
//     severity: 'Moderate',
//     reactionType: 'Immediate',
//     onsetDate: '',
//     notes: 'Avoid all penicillin-based antibiotics.',
//   },
//   {
//     id: 2,
//     allergen: 'Peanuts',
//     type: 'Food',
//     reaction: 'Anaphylaxis',
//     severity: 'High',
//     reactionType: 'Immediate',
//     onsetDate: '',
//     notes: 'Carry epinephrine injector.',
//   },
// ];

// const encounter = useEncounter();
// const backendAllergies = encounter.allergies();

// // Normalize immediately and update backend-linked state
// const [allergies, setAllergies] = useState(
//   backendAllergies.map(normalizeAllergy)
// );

// // Optional: persist normalization back to backend immediately
// setAllergies(backendAllergies.map(normalizeAllergy));


export const Allergies = () => {
  const { useChart, useEncounter } = usePatient();
  const [allergies, setAllergies] = useEncounter().allergies();
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);  // <--- selected from search, waiting to add
  const [lastReviewed, setLastReviewed] = useState(null);

// --- Add this utility function ---
const normalizeAllergy = (data) => {
  const capitalize = (str) =>
    typeof str === "string" && str.length > 0
      ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      : "";

  return {
    id: data.id || null,
    allergen: capitalize(data.allergen || ""),
    type: capitalize(data.type || ""),
    reaction: capitalize(data.reaction || ""),
    severity: capitalize(data.severity || ""),
    reactionType: capitalize(data.reactionType || ""),
    onsetDate: data.onsetDate || "",
    notes: data.notes || data.comment || "",
  };
};
React.useEffect(() => {
    setAllergies((prev) => prev.map(normalizeAllergy));
  }, []); // runs only once

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
    // filter out any NaN or undefined ids
    const validIds = allergies
      .map(a => Number(a.id))
      .filter(id => Number.isFinite(id));

    const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;

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

const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');

  // On Add button click, open editor with selectedAgent (or empty if none selected)
const handleAddClick = () => {
  const agentName = selectedAgent?.allergen?.trim() || '';

  // Check for duplicates
  if (agentName) {
    const alreadyExists = allergies.some(
      (a) => a?.allergen?.trim().toLowerCase() === agentName.toLowerCase()
    );
    if (alreadyExists) {
      setSnackbarMessage('Allergen already on file');
      setSnackbarOpen(true);
      return;
    }
  }

  if (selectedAgent) {
    setEditingAllergy(normalizeAllergy(selectedAgent));
  } else {
    setEditingAllergy(
      normalizeAllergy({
        allergen: '',
        type: '',
        reaction: '',
        severity: '',
        reactionType: '',
        recorded: '',
        comment: '',
      })
    );
  }

  setIsEditingMode(true);
  setLastReviewed(null);
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
    <Box sx={{height: '95vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper'}}>
      <Box sx={{ bgcolor: 'grey.100',pt: 4, pb: 1, px:3, borderRadius: 1, mb: 1 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' , color: colors.blue[500]}}> 
        Allergies / Contraindications
      </Typography>

      <Box display="flex" alignItems="center" mb={1} gap={2} >
        <AgentSearchMenu onAgentSelect={handleAgentSelect} />
            <Button
              variant="outlined"
              startIcon={<Icon sx={{ color: 'green' }}>add_task</Icon>} 
              onClick={handleAddClick}>
              Add
            </Button>
      </Box>

      </Box>


      <Box sx={{flexGrow: 1, overflowY: 'auto',px: 3, py:1 , mb: 1}}>
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
    color: colors.grey[700],
    borderColor: colors.grey[700],
    '&:hover': {
      borderColor: colors.grey[700],
      backgroundColor: colors.grey[300], // subtle hover effect
    },
  }}> <Icon>check</Icon>Mark as Reviewed </Button>
        <Button variant="outlined" sx={{
    color: colors.grey[700],
    borderColor: colors.grey[700],
    '&:hover': {
      borderColor: colors.grey[700],
      backgroundColor: colors.grey[300], // subtle hover effect
    },
  }}>Unable to Assess</Button>
        <Typography variant="body2"sx={{color: lastReviewed ? 'green' : 'gray',fontStyle: 'italic'}}>
          {lastReviewed ? `Last Reviewed at ${lastReviewed}` : 'Not Reviewed'}
        </Typography>

            </Box>
              <Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert severity="error" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>
    </Box>
    
  );
  
};
