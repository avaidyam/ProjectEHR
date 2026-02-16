import * as React from 'react';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridColumnVisibilityModel, GridRowId } from '@mui/x-data-grid';
import { GRID_DETAIL_PANEL_TOGGLE_COL_DEF } from '@mui/x-data-grid-pro';
import { DataGrid, useGridApiRef, Button, Icon, Box, Stack, Label, Autocomplete, Checkbox, IconButton, TitledCard, MarkReviewed } from 'components/ui/Core';
import { Database, usePatient } from 'components/contexts/PatientContext';
import { getICD10CodeDescription } from 'util/helpers';
import { ProblemListEditor } from './components/ProblemListEditor';
import { DiagnosisPicker } from './components/DiagnosisPicker';

const CustomToolbar = () => {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
      <Stack direction="row" alignItems="center">
        <Checkbox name="showPastProblems" size="small" />
        <Label sx={{ fontSize: '0.875rem' }}>Show Past Problems</Label>
      </Stack>
      <Box>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
      </Box>
    </GridToolbarContainer>
  );
};

export const ProblemListTabContent: React.FC = () => {
  const { useEncounter } = usePatient()
  const [problems, setProblems] = useEncounter().problems([])
  const [medicalHx, setMedicalHx] = useEncounter().history.medical([])

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<GridRowId>>(new Set());
  const [idToUpdate, setIdToUpdate] = React.useState<Database.Problem.ID | null>(null);
  const apiRef = useGridApiRef();

  // Ensure all items have an ID
  React.useEffect(() => {
    if (problems) {
      let madeChanges = false;
      const newProblems = problems.map((item: any) => {
        if (!item.id) {
          madeChanges = true;
          return { ...item, id: Database.Problem.ID.create() };
        }
        return item;
      });

      if (madeChanges) {
        setProblems(newProblems);
      }
    }
  }, [problems, setProblems]);

  const handleRowDoubleClick = React.useCallback((params: any) => apiRef.current?.toggleDetailPanel(params.id), [apiRef]);

  const handleExpandRow = (id: Database.Problem.ID) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenModal = (id: Database.Problem.ID | null, term = "") => {
    setIdToUpdate(id);
    setSearchTerm(term);
    setIsModalOpen(true);
  };

  const handleSelect = (selection: any) => {
    setIsModalOpen(false);
    if (!selection) {
      setIdToUpdate(null);
      return;
    }

    // Convert selection to array if it's a single object
    const selectedItems = Array.isArray(selection) ? selection : [selection];

    if (selectedItems.length === 0) return;

    if (idToUpdate !== null && selectedItems.length > 0) {
      // UPDATE the existing problem
      const item = selectedItems[0];
      const updatedProblems = problems!.map((problem) =>
        problem.id === idToUpdate ? { ...problem, displayAs: item.name, diagnosis: item.conceptId as Database.DiagnosisCode } : problem
      );
      setProblems(updatedProblems);
    } else {
      // ADD new problem(s)
      const newProblems = selectedItems.map(item => ({
        id: Database.Problem.ID.create(),
        diagnosis: item.conceptId as Database.DiagnosisCode,
        displayAs: item.name,
        class: '',
        chronic: false,
        priority: '',
        notedDate: (new Date()).toISOString() as Database.JSONDate,
        encounterDx: false,
        isNew: true
      }));
      const newIds = newProblems.map(p => p.id);

      setProblems([...problems!, ...newProblems]);
      setExpandedRowIds(prev => {
        const next = new Set(prev);
        newIds.forEach(id => next.add(id));
        return next;
      });
    }
    setIdToUpdate(null);
  };

  const handleSaveProblem = (id: any, updatedRow: any, addToHistory?: boolean) => {
    setProblems((prev: any) =>
      prev.map((row: any) => (row.id === id ? { ...updatedRow, isNew: false } : row))
    );

    if (addToHistory) {
      const newHistoryItem = {
        id: Database.MedicalHistoryItem.ID.create(),
        diagnosis: updatedRow.diagnosis,
        displayAs: updatedRow.displayAs || getICD10CodeDescription(updatedRow.diagnosis) || 'Unknown',
        date: (updatedRow.notedDate || (new Date()).toISOString()) as Database.JSONDate,
        source: Database.MedicalHistoryItem.Source.Clinician,
        comment: updatedRow.comment || '',
      };
      setMedicalHx((prev: any) => [...(prev ?? []), newHistoryItem]);
    }

    handleExpandRow(id);
  };

  const handleDeleteProblem = (id: Database.Problem.ID) => {
    const updatedProblems = problems!.filter((p) => p.id !== id);
    setProblems(updatedProblems);
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const columns = [
    {
      field: 'chronic',
      headerName: 'Chronic',
      width: 70,
      initialHidden: true,
      renderCell: (params: any) => (
        params.value ? <Icon>push_pin</Icon> : null
      )
    },
    {
      field: 'displayAs',
      headerName: 'Diagnosis',
      hideable: false,
      flex: 1,
      valueGetter: (value: any, row: any) => {
        const r = row || value.row;
        if (!r) return '';
        const name = r.displayAs || getICD10CodeDescription(r.diagnosis) || 'Unknown';
        return `${name} (${r.diagnosis})`;
      }
    },
    {
      field: 'priority',
      headerName: 'Priority',
      initialHidden: true,
      width: 100
    },
    {
      field: 'class',
      headerName: 'Class',
      initialHidden: true,
      width: 100
    },
    {
      field: 'notedDate',
      headerName: 'Noted',
      initialHidden: true,
      width: 120,
      valueGetter: (value: any, row: any) => {
        const r = row || value.row;
        if (!r?.notedDate) return 'N/A';
        return Database.JSONDate.toDateString(r.notedDate);
      }
    },
    {
      field: 'diagnosedDate',
      headerName: 'Diagnosed',
      initialHidden: true,
      width: 120,
      valueGetter: (value: any, row: any) => {
        const r = row || value.row;
        if (!r?.diagnosedDate) return 'N/A';
        return Database.JSONDate.toDateString(r.diagnosedDate);
      }
    },
    {
      field: 'updatedDate',
      headerName: 'Updated',
      initialHidden: true,
      width: 120,
      valueGetter: (value: any, row: any) => {
        const r = row || value.row;
        if (!r?.updatedDate) return 'N/A';
        return Database.JSONDate.toDateString(r.updatedDate);
      }
    },
    {
      field: 'encounterDx',
      headerName: 'Encounter Dx',
      width: 120,
      renderCell: (params: any) => (
        <Checkbox
          size="small"
          checked={!!params.value}
          onChange={(e) => {
            setProblems((prev: any) =>
              prev.map((row: any) => (row.id === params.row.id ? { ...row, encounterDx: e.target.checked } : row))
            );
          }}
        />
      )
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
      renderCell: (params: any) => (
        <Button size="small" onClick={() => handleOpenModal(params.row.id)}>
          <Icon>change_history</Icon>
        </Button>
      )
    },
    {
      field: 'resolved',
      headerName: 'Resolved',
      width: 100,
      renderCell: (params: any) => (
        <Button size="small" onClick={() => handleDeleteProblem(params.row.id)}>
          <Icon>clear</Icon>
        </Button>
      )
    },
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      hideable: false
    }
  ];

  const columnVisibilityModel = columns.reduce((acc, col) => {
    if (col.initialHidden) {
      acc[col.field] = false;
    }
    return acc;
  }, {} as GridColumnVisibilityModel);

  return (
    <Box sx={{ height: '100%' }}>
      <Stack direction="column" sx={{ height: '100%', p: 2 }}>
        <Label variant="h6" sx={{ pb: 1 }}>Problem List</Label>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" alignItems="center">
            <Autocomplete
              freeSolo
              label="Search for problem"
              size="small"
              value={searchTerm}
              onInputChange={(_e, newValue) => setSearchTerm(newValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleOpenModal(null, searchTerm);
                }
              }}
              options={[]}
              sx={{ width: 250 }}
            />
            <Button
              variant="outlined"
              sx={{ height: '40px', marginLeft: '-1px' }}
              onClick={() => handleOpenModal(null, searchTerm)}
            >
              <Icon color="success">add_task</Icon>Add
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <DataGrid
            apiRef={apiRef}
            initialState={{
              columns: {
                columnVisibilityModel,
              },
            }}
            rows={problems ?? []}
            getRowId={(row: any) => row.id}
            columns={columns}
            onRowDoubleClick={handleRowDoubleClick}
            detailPanelExpandedRowIds={expandedRowIds}
            onDetailPanelExpandedRowIdsChange={ids => setExpandedRowIds(new Set(ids))}
            getDetailPanelContent={({ row }) => (
              <Box sx={{ p: 2, width: '100%', bgcolor: 'background.paper' }}>
                <ProblemListEditor
                  data={row}
                  index={row.id}
                  expandedRows={handleExpandRow}
                  onDelete={handleDeleteProblem}
                  onOpenModal={() => handleOpenModal(row.id)}
                  medicalHx={medicalHx ?? []}
                  onSave={handleSaveProblem}
                />
              </Box>
            )}
            getDetailPanelHeight={() => 'auto'}
            showToolbar
            slots={{ toolbar: CustomToolbar }}
            hideFooter
            disableColumnMenu
          />
        </Box>
        <MarkReviewed />
      </Stack>
      <DiagnosisPicker
        open={isModalOpen}
        searchTerm={searchTerm}
        onSelect={handleSelect}
      />
    </Box>
  );
};
