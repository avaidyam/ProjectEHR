import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Toolbar, IconButton, Tooltip, Divider, Icon } from '@mui/material';
import { useDatabase } from 'components/contexts/PatientContext';
import { ListFormModal } from './components/ListFormModal';
import { PatientsTable } from './components/PatientsTable';
import { ListsSidebar } from './components/ListsSidebar';
import { PrintPreviewDialog } from './components/PrintPreviewDialog';

export function PatientLists() {
  const { listId: selectedListId } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useDatabase().lists();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = React.useState(false);
  const selectedList = lists.find((list) => list.id === selectedListId);

  // Cmd/Ctrl+P shortcut to open print preview
  React.useEffect(() => {
    const handlePrintShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPrintPreviewOpen(true);
      }
    };
    window.addEventListener('keydown', handlePrintShortcut);
    return () => window.removeEventListener('keydown', handlePrintShortcut);
  }, []);

  return (
    <Box sx={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
      <Box sx={{ borderRadius: 1 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>Patient Lists</Typography>
        </Box>
        <Toolbar variant="dense" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Icon>add</Icon>}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New List
            </Button>
            <Button
              size="small"
              startIcon={<Icon>edit</Icon>}
              onClick={() => setIsEditModalOpen(true)}
              disabled={!selectedList || selectedList.type !== 'my'}
            >
              Edit List
            </Button>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Print">
              <IconButton size="small" onClick={() => setIsPrintPreviewOpen(true)}>
                <Icon>print</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton size="small">
                <Icon>refresh</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter">
              <IconButton size="small">
                <Icon>filter_list</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Search">
              <IconButton size="small">
                <Icon>search</Icon>
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="More options">
            <IconButton size="small">
              <Icon>more_vert</Icon>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Box>
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2 }}>
        <ListsSidebar
          lists={lists}
          selectedListId={selectedListId}
        />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: "80vh" }}>
          <PatientsTable
            lists={lists}
            selectedList={selectedList}
            setLists={setLists}
          />
        </Box>
      </Box>
      <ListFormModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(name, columns) => {
          const columnConfig = columns.map((col, index) => ({
            id: col.id,
            label: col.label,
            selected: col.selected,
            order: index,
          }));

          const newList = {
            id: `my-${Date.now()}`,
            name,
            type: 'my',
            patients: [],
            columns: columnConfig,
          };

          setLists((prevLists) => [...prevLists, newList]);
          setIsCreateModalOpen(false);
          navigate(`/list/${newList.id}`);
        }}
      />
      {selectedList && (
        <ListFormModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(name, columns) => {
            setLists((prevLists) =>
              prevLists.map((list) =>
                list.id === selectedListId
                  ? { ...list, name, columns }
                  : list
              )
            );
            setIsEditModalOpen(false);
          }}
          initialData={selectedList}
        />
      )}
      <PrintPreviewDialog
        open={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        list={selectedList!}
      />
    </Box>
  )
}
