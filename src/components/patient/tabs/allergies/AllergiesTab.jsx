// AllergiesTab.jsx
import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AllergiesTable from './AllergiesTable';
import AllergyEditor from './AllergyEditor'; // Renamed import
import AgentSearchMenu from './AgentSearchMenu';

const initialAllergies = [
  {
    id: 1,
    agent: 'Penicillin',
    type: 'Drug',
    reaction: 'Anaphylaxis',
    severity: 'High',
    reactionType: 'Immediate',
    onsetDate: '2022-04-01',
    notes: 'Patient experienced throat swelling.'
  },
  {
    id: 2,
    agent: 'Crab',
    type: 'Food',
    reaction: 'Hives, Anaphylaxis',
    severity: 'High',
    reactionType: 'Immediate',
    onsetDate: '2020-03-16',
    notes: ''
  },
  {
    id: 3,
    agent: 'Metoprolol',
    type: 'Drug Ingredient',
    reaction: 'Other, see comment',
    severity: 'Not Specified',
    reactionType: '',
    onsetDate: '2020-03-16',
    notes: 'Severe reactions, lack of therapeutic effect'
  },
  {
    id: 4,
    agent: 'Codeine',
    type: 'Drug Ingredient',
    reaction: 'Rash',
    severity: 'Low',
    reactionType: '',
    onsetDate: '2020-03-16',
    notes: ''
  },
  {
    id: 5,
    agent: 'Demerol [Meperidine]',
    type: 'Drug Ingredient',
    reaction: 'Rash',
    severity: 'Low',
    reactionType: '',
    onsetDate: '2020-03-16',
    notes: ''
  },
  {
    id: 6,
    agent: 'Xanax [Alprazolam]',
    type: 'Drug Ingredient',
    reaction: 'Hives',
    severity: 'Low',
    reactionType: 'Systemic',
    onsetDate: '2016-10-10',
    notes: ''
  },
  {
    id: 7,
    agent: 'Amoxicillin-potassium clavulanate',
    type: 'Drug',
    reaction: 'Nausea & Vomiting, GI upset',
    severity: 'Low',
    reactionType: 'Intolerance',
    onsetDate: '2023-03-20',
    notes: ''
  }
];

const AllergiesTab = () => {
  const [allergies, setAllergies] = useState(initialAllergies);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false); // New state to control editor visibility

  const handleEdit = (allergy) => {
    setEditingAllergy(allergy);
    setIsEditingMode(true); // Show editor
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
      // For adding, assign a new ID
      const newId = Math.max(...allergies.map((a) => a.id)) + 1;
      setAllergies((prev) => [
        ...prev,
        { id: newId, ...newAllergyData }
      ]);
    }
    setIsEditingMode(false); // Hide editor after save
    setEditingAllergy(null); // Clear editing state
  };

  const handleDeleteAllergy = (id) => {
    setAllergies((prev) => prev.filter((allergy) => allergy.id !== id));
    if (editingAllergy && editingAllergy.id === id) {
        setIsEditingMode(false); // Hide editor if the deleted item was being edited
        setEditingAllergy(null);
    }
  };

  const handleAgentSelect = (agentObject) => {
    setEditingAllergy({ ...agentObject, id: null }); // Set initial data for new entry, id: null indicates new
    setIsEditingMode(true); // Show editor
  };

  const handleCancelEdit = () => {
    setIsEditingMode(false); // Hide editor
    setEditingAllergy(null); // Clear editing state
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Allergies / Contraindications
      </Typography>

      <Box display="flex" alignItems="center" mb={2}>
        <AgentSearchMenu onAgentSelect={handleAgentSelect} />
        {/* The "Add" button here seems redundant given the Autocomplete. 
            If it's meant to open a blank editor without selecting an agent first, 
            its logic would need to be added. Keeping it hidden as before for now. */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: 2, visibility: 'hidden' }}
        >
          Add
        </Button>
      </Box>

      <AllergiesTable
        allergies={allergies} // Pass allergies as prop
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
  );
};

export default AllergiesTab;