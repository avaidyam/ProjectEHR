import * as React from 'react';
import { TextField, Checkbox, IconButton } from '@mui/material';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { GRID_DETAIL_PANEL_TOGGLE_COL_DEF } from '@mui/x-data-grid-pro';
import { DataGrid, Button, Icon, Box, Stack, Label } from 'components/ui/Core';
import { usePatient } from 'components/contexts/PatientContext';
import { ProblemListEditor } from './components/ProblemListEditor';
import { DiagnosisPicker } from './components/DiagnosisPicker';

const CustomToolbar = () => {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'flex-end' }}>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
    </GridToolbarContainer>
  );
};

export const ProblemListTabContent = ({ children, ...other }: { children?: React.ReactNode;[key: string]: any }) => {
  const { useEncounter } = usePatient()
  const [problems, setProblems] = (useEncounter() as any).problems([])

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<any>>(new Set());
  const [indexToUpdate, setIndexToUpdate] = React.useState<number | null>(null);

  const handleExpandRow = (rowIndex: any) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  };

  const handleOpenModal = (index: number | null, term = "") => {
    setIndexToUpdate(index);
    setSearchTerm(term);
    setIsModalOpen(true);
  };

  const handleSelect = (selection: any) => {
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
      const updatedProblems = (problems as any[]).map((problem, i) =>
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
      const startIdx = (problems as any[]).length;
      const newIds = newProblems.map((_, i) => startIdx + i);

      setProblems([...(problems as any[]), ...newProblems]);
      setExpandedRowIds((prev: Set<any>) => {
        const next = new Set(prev);
        newIds.forEach(id => next.add(id));
        return next;
      });
    }
    setIndexToUpdate(null);
  };

  const handleDeleteProblem = (index: number) => {
    const updatedProblems = (problems as any[]).filter((_, i) => i !== index);
    setProblems(updatedProblems);
    setExpandedRowIds((prev: Set<any>) => {
      const next = new Set();
      prev.forEach((id: any) => {
        if (id !== index) {
          next.add((id as number) > index ? (id as number) - 1 : id);
        }
      });
      return next;
    });
  };

  const columns = [
    {
      field: 'isChronicCondition',
      headerName: 'Chronic',
      width: 70,
      initialHidden: true,
      renderCell: (params: any) => (
        params.value ? <Icon>push_pin</Icon> : null
      )
    },
    {
      field: 'diagnosis',
      headerName: 'Diagnosis',
      hideable: false,
      flex: 1,
      valueGetter: (value: any, row: any) => {
        if (row) return row.display || row.diagnosis;
        return value.row?.display || value.row?.diagnosis;
      }
    },
    {
      field: 'code',
      headerName: 'Code',
      initialHidden: true,
      width: 100
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
    },
    {
      field: 'diagnosedDate',
      headerName: 'Diagnosed',
      initialHidden: true,
      width: 120
    },
    {
      field: 'updatedDate',
      headerName: 'Updated',
      initialHidden: true,
      width: 120
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
      hideable: false,
      renderCell: (params: any) => (
        <IconButton size="small" onClick={() => handleExpandRow(params.row.id)}>
          <Icon>{expandedRowIds.has(params.row.id) ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'}</Icon>
        </IconButton>
      )
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
          </Stack>
          <Stack direction="row" alignItems="center" ml={2}>
            <Label>Show:</Label>
            <Checkbox name="showPastProblems" />
            <Label>Past Problems</Label>
            <Button variant="outlined" style={{ marginLeft: '1em' }}>
              View Drug-Disease Interactions
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <DataGrid
            initialState={{
              columns: {
                columnVisibilityModel,
              },
            }}
            rows={(problems ?? []).map((p: any, i: number) => ({ id: i, ...p }))}
            columns={columns as any[]}
            detailPanelExpandedRowIds={expandedRowIds as any}
            onDetailPanelExpandedRowIdsChange={(ids: any) => setExpandedRowIds(ids)}
            getDetailPanelContent={({ row }: { row: any }) => (
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
            showToolbar
            slots={{ toolbar: CustomToolbar }}
            hideFooter
            disableColumnMenu
          />
        </Box>
      </Stack>
      <DiagnosisPicker
        open={isModalOpen}
        searchTerm={searchTerm}
        onSelect={handleSelect}
      />
    </Box>
  );
};
