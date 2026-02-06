import React, { useState } from 'react';
import { Typography, TextField, Checkbox, Paper, IconButton } from '@mui/material';
import { DataGrid, Button, Icon, Box } from 'components/ui/Core.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import ProblemListEditor from './components/ProblemListEditor.jsx';
import { DiagnosisPicker } from './components/DiagnosisPicker.jsx';

const ProblemListTabContent = ({ children, ...other }) => {
  const { useEncounter } = usePatient()
  const [problems, setProblems] = useEncounter().problems([])

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [indexToUpdate, setIndexToUpdate] = useState(null);

  const handleExpandRow = (rowIndex) => {
    setExpandedRowIds(prev =>
      prev.includes(rowIndex)
        ? prev.filter(id => id !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const handleOpenModal = (index, term = "") => {
    setIndexToUpdate(index);
    setSearchTerm(term);
    setIsModalOpen(true);
  };

  const handleSelect = (selection) => {
    setIsModalOpen(false);
    if (!selection) {
      setIndexToUpdate(null);
      return;
    }

    // Convert selection to array if it's a single object
    const selectedItems = Array.isArray(selection) ? selection : [selection];

    if (selectedItems.length === 0) return;

    if (indexToUpdate !== null && selectedItems.length > 0) {
      // UPDATE the existing problem
      const item = selectedItems[0];
      const updatedProblems = problems.map((problem, i) =>
        i === indexToUpdate ? { ...problem, diagnosis: item.name, code: item.conceptId } : problem
      );
      setProblems(updatedProblems);
    } else {
      // ADD new problem(s)
      const newProblems = selectedItems.map(item => ({
        diagnosis: item.name,
        code: item.conceptId,
        display: item.name,
        // Add other properties as needed for the new problem row
      }));

      // Calculate new IDs (indexes) based on current length
      // Note: In a real app we should use stable IDs. Here we rely on index.
      // We need to auto-expand the new rows.
      const startIdx = problems.length;
      const newIds = newProblems.map((_, i) => startIdx + i);

      setProblems([...problems, ...newProblems]);
      setExpandedRowIds(prev => [...prev, ...newIds]);
    }
    setIndexToUpdate(null);
  };

  const handleDeleteProblem = (index) => {
    const updatedProblems = problems.filter((_, i) => i !== index);
    setProblems(updatedProblems);
    // Remove the deleted index from expanded rows, and shift indices greater than it
    // This is tricky with index-based IDs. 
    // Ideally we just clear expansion or try to keep it sane.
    setExpandedRowIds(prev => prev.filter(id => id !== index).map(id => id > index ? id - 1 : id));
  };

  const columns = [
    {
      field: 'diagnosis',
      headerName: 'Diagnosis',
      flex: 1,
      valueGetter: (value, row) => {
        if (row) return row.display || row.diagnosis;
        // Fallback for older versions if row is in the first arg
        return value.row?.display || value.row?.diagnosis;
      }
    },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 150,
      renderCell: () => <Button size="small">Create Overview</Button>
    },
    {
      field: 'hospital',
      headerName: 'Hospital',
      width: 100,
      renderCell: () => <Checkbox size="small" />
    },
    {
      field: 'principal',
      headerName: 'Principal',
      width: 100,
      renderCell: () => <Button size="small"><Icon>pentagon</Icon></Button>
    },
    {
      field: 'change',
      headerName: 'Change Dx',
      width: 100,
      renderCell: (params) => (
        <Button size="small" onClick={() => handleOpenModal(params.row.id)}>
          <Icon>change_history</Icon>
        </Button>
      )
    },
    {
      field: 'resolved',
      headerName: 'Resolved',
      width: 100,
      renderCell: (params) => (
        <Button size="small" onClick={() => handleDeleteProblem(params.row.id)}>
          <Icon>clear</Icon>
        </Button>
      )
    },
    {
      field: 'expand',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <IconButton size="small" onClick={() => handleExpandRow(params.row.id)}>
          <Icon>{expandedRowIds.includes(params.row.id) ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'}</Icon>
        </IconButton>
      )
    }
  ];

  return (
    <div className="tab-content-container">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1em' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search for problem"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleOpenModal(null, searchTerm);
                }
              }}
              style={{ marginRight: 0 }}
            />
            <Button
              variant="outlined"
              style={{ height: '40px', marginLeft: '-1px' }}
              onClick={() => handleOpenModal(null, searchTerm)}
            >
              <Icon color="success">add_task</Icon>Add
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1em' }}>
            <Typography>Show:</Typography>
            <Checkbox name="showPastProblems" />
            <Typography>Past Problems</Typography>
            <Button variant="outlined" style={{ marginLeft: '1em' }}>
              View Drug-Disease Interactions
            </Button>
          </div>
        </div>

        <Box sx={{ flexGrow: 1, height: 500 }}>
          <DataGrid
            rows={(problems ?? []).map((p, i) => ({ id: i, ...p }))}
            columns={columns}
            detailPanelExpandedRowIds={expandedRowIds}
            onDetailPanelExpandedRowIdsChange={setExpandedRowIds}
            getDetailPanelContent={({ row }) => (
              <Box sx={{ p: 2, width: '100%', bgcolor: 'background.paper' }}>
                <ProblemListEditor
                  data={row}
                  index={row.id}
                  expandedRows={handleExpandRow}
                  onDelete={handleDeleteProblem}
                  onOpenModal={() => handleOpenModal(row.id)}
                />
              </Box>
            )}
            getDetailPanelHeight={() => 'auto'}
            hideFooter
            disableColumnMenu
          />
        </Box>
      </div>

      <DiagnosisPicker
        open={isModalOpen}
        searchTerm={searchTerm}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default ProblemListTabContent;
