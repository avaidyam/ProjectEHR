import React, { useState, useMemo } from 'react';
import { Box, Stack, Tabs, Tab, Typography, Toolbar, Button, Icon } from '@mui/material';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid-premium';
import { DataGrid, Spacer } from 'components/ui/Core';
import { GridToolbarSortButton } from 'components/ui/GridToolbarSortButton';
import { useSplitView } from 'components/contexts/SplitViewContext.jsx';
import { usePatient, useDatabase } from 'components/contexts/PatientContext.jsx';
import NoteViewer from '../NoteViewer/NoteViewer.jsx';

export const NotesList = () => {
  const { useEncounter } = usePatient();
  const { openTab } = useSplitView();
  const [notes] = useEncounter().notes();
  const [providers] = useDatabase().providers();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNote, setSelectedNote] = useState(null);

  // Extract unique categories from notes
  const categories = useMemo(() => {
    const categorySet = new Set(['All']);
    (notes || []).forEach(note => {
      if (note.type) {
        categorySet.add(note.type);
      }
    });
    return Array.from(categorySet);
  }, [notes]);

  // Filter notes by selected category
  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    if (selectedCategory === 'All') return notes;
    return notes.filter(note => note.type === selectedCategory);
  }, [notes, selectedCategory]);

  // Auto-select first note when filtered notes change
  React.useEffect(() => {
    if (filteredNotes.length > 0 && !selectedNote) {
      setSelectedNote(filteredNotes[0]);
    } else if (filteredNotes.length > 0 && !filteredNotes.find(n => n.id === selectedNote?.id)) {
      setSelectedNote(filteredNotes[0]);
    }
  }, [filteredNotes, selectedNote]);

  // Helper to get provider name
  const getProviderName = (providerId) => {
    const provider = (providers || []).find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  // Format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const COLUMNS = [
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      valueGetter: (value, row) => row.type || 'Unknown Type'
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      renderCell: ({ row }) => (
        <Box
          sx={{
            px: 1,
            py: 0.25,
            bgcolor: row.status === 'Signed' ? 'success.main' : 'warning.main',
            color: 'white',
            borderRadius: 1,
            fontSize: '0.75rem',
            display: 'inline-block'
          }}
        >
          {row.status || 'Unknown'}
        </Box>
      )
    },
    {
      field: 'author',
      headerName: 'Author',
      flex: 1,
      valueGetter: (value, row) => getProviderName(row.author || row.authorName)
    },
    {
      field: 'serviceDate',
      headerName: 'Date/Time',
      flex: 1.2,
      valueGetter: (value, row) => formatDateTime(row.serviceDate)
    }
  ];

  // Custom cell renderer for list view
  const ListViewCell = ({ row }) => {
    return (
      <Stack spacing={0.5} sx={{ py: 0.5, px: 1, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {row.type || 'Unknown Type'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              bgcolor: row.status === 'Signed' ? 'success.main' : 'warning.main',
              color: 'white',
              borderRadius: 1,
              fontSize: '0.7rem'
            }}
          >
            {row.status || 'Unknown'}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {getProviderName(row.author || row.authorName)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(row.serviceDate)}
        </Typography>
      </Stack>
    );
  };

  // Prepare rows for DataGrid
  const rows = filteredNotes.map((note, index) => ({
    id: note.id || `note-${index}`,
    ...note
  }));

  return (
    <Stack sx={{ height: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          minHeight: '48px !important'
        }}
        variant="dense"
      >
        <Typography variant="h6">Notes</Typography>
        <Spacer />
        <Button
          variant="contained"
          size="small"
          startIcon={<Icon>add</Icon>}
          onClick={() => {
            openTab("Edit Note", {}, "side", true);
            openTab("NoteWriter", {}, "main", false);
          }}
        >
          New Note
        </Button>
      </Toolbar>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
        >
          {categories.map(category => (
            <Tab key={category} label={category} value={category} />
          ))}
        </Tabs>
      </Box>

      {/* Master-Detail Layout */}
      <Stack direction="row" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Master List (Left Pane) - DataGrid */}
        <Box
          sx={{
            width: "25%",
            minWidth: 300,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: 'background.default'
          }}
        >
          <DataGrid
            rows={rows}
            columns={COLUMNS}
            listView={true}
            listViewColumn={{
              field: 'listColumn',
              renderCell: ({ row }) => <ListViewCell row={row} />
            }}
            slots={{
              toolbar: () => (
                <GridToolbarContainer sx={{ justifyContent: 'flex-start', borderBottom: 1, borderColor: 'divider' }}>
                  <GridToolbarColumnsButton />
                  <GridToolbarFilterButton />
                  <GridToolbarSortButton />
                </GridToolbarContainer>
              )
            }}
            hideFooter
            disableMultipleRowSelection={true}
            disableRowSelectionOnClick={false}
            onRowClick={(params) => setSelectedNote(params.row)}
            sx={{
              border: 0,
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer'
              }
            }}
          />
        </Box>

        {/* Detail Pane (Right/Main Pane) */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'background.paper'
          }}
        >
          {selectedNote ? (
            <NoteViewer data={selectedNote} />
          ) : (
            <Stack
              sx={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Select a note to view details
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default NotesList;
