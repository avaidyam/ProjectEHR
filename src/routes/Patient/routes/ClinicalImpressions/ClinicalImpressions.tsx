import React, { useState } from 'react';
import { Box, Button, Icon, TextField, Stack, TreeView, TreeItem, Label } from 'components/ui/Core';
import { usePatient } from 'components/contexts/PatientContext';
import { DiagnosisPicker } from '../ProblemList/components/DiagnosisPicker';

const ClinicalImpressions = () => {

  const { useEncounter } = usePatient()
  const [encounter, setEncounter] = (useEncounter() as any)()

  // If encounter exists, initialize clinical impressions
  const initialClinicalImpressions = encounter?.clinicalImpressions || [];
  const [clinicalImpressions, setClinicalImpressions] = useState<any[]>(initialClinicalImpressions);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateClinicalImpressions = (updated: any) => {
    setClinicalImpressions(updated);
    setEncounter({ ...encounter, clinicalImpressions: updated });
  };

  // Modal handlers
  const handleOpenModal = (term = "") => {
    setSearchTerm(term);
    setIsModalOpen(true);
  };

  const handleSelect = (selection: any) => {
    setIsModalOpen(false);
    if (!selection) return;

    // Convert selection to array if it's a single object
    const selectedItems = Array.isArray(selection) ? selection : [selection];

    if (selectedItems.length === 0) return;

    const newImpressions = selectedItems.map((item: any) => ({
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

  const handleDelete = (index: number) => {
    const updated = clinicalImpressions.filter((_: any, i: number) => i !== index);
    updateClinicalImpressions(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...clinicalImpressions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updateClinicalImpressions(updated);
  };

  const moveDown = (index: number) => {
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
          {clinicalImpressions.map((imp: any, index: number) => (
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
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); moveUp(index); }}
                      disabled={index === 0}
                    >
                      <Icon>arrow_upward</Icon>
                    </Button>
                    <Button
                      size="small"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); moveDown(index); }}
                      disabled={index === clinicalImpressions.length - 1}
                    >
                      <Icon>arrow_downward</Icon>
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(index); }}
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
