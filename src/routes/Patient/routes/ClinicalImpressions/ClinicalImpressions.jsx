import React, { useState } from 'react';
import { Box, Button, Icon, TextField, Stack, TreeView, TreeItem, Label } from 'components/ui/Core.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import { DiagnosisPicker } from '../ProblemList/components/DiagnosisPicker.jsx';

const ClinicalImpressions = () => {

  const { useEncounter } = usePatient()
  const [encounter, setEncounter] = useEncounter()()

  // If encounter exists, initialize clinical impressions
  const initialClinicalImpressions = encounter?.clinicalImpressions || [];
  const [clinicalImpressions, setClinicalImpressions] = useState(initialClinicalImpressions);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateClinicalImpressions = (updated) => {
    setClinicalImpressions(updated);
    setEncounter({ ...encounter, clinicalImpressions: updated });
  };

  // Modal handlers
  const handleOpenModal = (term = "") => {
    setSearchTerm(term);
    setIsModalOpen(true);
  };

  const handleSelect = (selection) => {
    setIsModalOpen(false);
    if (!selection) return;

    // Convert selection to array if it's a single object
    const selectedItems = Array.isArray(selection) ? selection : [selection];

    if (selectedItems.length === 0) return;

    const newImpressions = selectedItems.map(item => ({
      name: item.name,
      code: item.conceptId,
      id: item.conceptId
    }));

    // Check for duplicates before adding? Or just allow dupes?
    // Let's filter out dupes based on duplicate ID/code invocation if we want, 
    // but the initial logic allowed unchecked appending. Let's stick to appending.

    const updated = [...clinicalImpressions, ...newImpressions];
    updateClinicalImpressions(updated);
  };

  const handleDelete = (index) => {
    const updated = clinicalImpressions.filter((_, i) => i !== index);
    updateClinicalImpressions(updated);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...clinicalImpressions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updateClinicalImpressions(updated);
  };

  const moveDown = (index) => {
    if (index === clinicalImpressions.length - 1) return;
    const updated = [...clinicalImpressions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updateClinicalImpressions(updated);
  };

  return (
    <Stack direction="column" spacing={2} sx={{ padding: 2, textAlign: 'left' }}>
      <Label variant="h6" sx={{ mb: 1, display: 'block' }}>Clinical Impressions</Label>
      <Stack direction="row">
        <TextField
          placeholder="Add a new impression"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOpenModal(searchTerm);
            }
          }}
          InputProps={{
            endAdornment:
              <Button
                variant="text"
                onClick={() => handleOpenModal(searchTerm)}
                sx={{ height: '56px' }}
              >
                <Icon color="success">add_task</Icon> Add
              </Button>
          }}
        />
      </Stack>

      <Box paper sx={{ p: 2 }}>
        {clinicalImpressions.length === 0 &&
          <Label sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No clinical impressions recorded.</Label>
        }
        <TreeView>
          {clinicalImpressions.map((imp, index) => (
            <TreeItem
              key={index}
              itemId={`impression-${index}`}
              label={
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
                  <Label>{index + 1}. {imp.name}</Label>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                      onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                      disabled={index === 0}
                    >
                      <Icon>arrow_upward</Icon>
                    </Button>
                    <Button
                      size="small"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                      onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                      disabled={index === clinicalImpressions.length - 1}
                    >
                      <Icon>arrow_downward</Icon>
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                    >
                      <Icon>close</Icon>
                    </Button>
                  </Box>
                </Stack>
              }
            />
          ))}
        </TreeView>
      </Box>
      <DiagnosisPicker
        open={isModalOpen}
        searchTerm={searchTerm}
        onSelect={handleSelect}
      />
    </Stack>
  );
};

export default ClinicalImpressions;
