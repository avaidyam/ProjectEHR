import React, { useState, useMemo } from 'react';
import { Box, Stack, Tabs, Tab, Typography, Toolbar, Button, Icon } from '@mui/material';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid-premium';
import { DataGrid, Spacer } from 'components/ui/Core';
import { GridToolbarSortButton } from 'components/ui/GridToolbarSortButton';
import { useSplitView } from 'components/contexts/SplitViewContext';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';
import { NoteViewer } from '../NoteViewer/NoteViewer';

export const NotesList = () => {
  const { useEncounter } = usePatient();
  const { openTab } = useSplitView();
  const [notes] = (useEncounter() as any).notes();
  const [conditionals] = (useEncounter() as any).conditionals();
  const [orders] = (useEncounter() as any).orders();
  const [providers] = (useDatabase() as any).providers();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const visibleNotes = useMemo(() => {
    return filterDocuments(notes, conditionals, orders);
  }, [notes, conditionals, orders]);

  // Extract unique categories from notes
  const categories = useMemo(() => {
    const categorySet = new Set(['All']);
    (visibleNotes || []).forEach((note: any) => {
      if (note.type) {
        categorySet.add(note.type);
      }
    });
    return Array.from(categorySet);
  }, [visibleNotes]);

  // Filter notes by selected category
  const filteredNotes = useMemo(() => {
    if (!visibleNotes) return [];
    if (selectedCategory === 'All') return visibleNotes;
    return visibleNotes.filter((note: any) => note.type === selectedCategory);
  }, [visibleNotes, selectedCategory]);

  // Auto-select first note when filtered notes change
  React.useEffect(() => {
    if (filteredNotes.length > 0 && !selectedNote) {
      setSelectedNote(filteredNotes[0]);
    } else if (filteredNotes.length > 0 && !filteredNotes.find((n: any) => n.id === selectedNote?.id)) {
      setSelectedNote(filteredNotes[0]);
    }
  }, [filteredNotes, selectedNote]);

  // Helper to get provider name
  const getProviderName = (providerId: any) => {
    const provider = (providers || []).find((p: any) => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  // Format date/time
  const formatDateTime = (dateString: string | null | undefined) => {
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
      valueGetter: (value: any, row: any) => row.type || 'Unknown Type'
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      renderCell: ({ row }: { row: any }) => (
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
      valueGetter: (value: any, row: any) => getProviderName(row.author || row.authorName)
    },
    {
      field: 'serviceDate',
      headerName: 'Date/Time',
      flex: 1.2,
      valueGetter: (value: any, row: any) => formatDateTime(row.serviceDate)
    }
  ];

  // Custom cell renderer for list view
  const ListViewCell = ({ row }: { row: any }) => {
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
  const rows = filteredNotes.map((note: any, index: number) => ({
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
          onChange={(e: any, newValue: any) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
        >
          {categories.map((category: string) => (
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
              renderCell: ({ row }: { row: any }) => <ListViewCell row={row} />
            }}
            showToolbar
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
            onRowClick={(params: any) => setSelectedNote(params.row)}
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
