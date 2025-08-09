import { 
  Box, 
  Button,  
  Typography, 
  Toolbar,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import React, { createContext, useState, useContext } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { ListFormModal } from './components/ListFormModal.jsx';
import { PatientsTable } from './components/PatientsTable.jsx';
import { ListsSidebar } from './components/ListsSidebar.jsx';

function PatientLists() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedListId = searchParams.get('listId');
  const [lists, setLists] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedList = lists.find(list => list.id === selectedListId);

  const handleCreateList = (name, columns) => {
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
    setSearchParams({ listId: newList.id }, { replace: true });
  };

  const handleEditList = (name, columns) => {
    setLists(prevLists => 
      prevLists.map(list => 
        list.id === selectedListId
          ? { ...list, name, columns }
          : list
      )
    );
    setIsEditModalOpen(false);
  };

  // Create the context value object with all the state and functions
  const contextValue = {
    selectedListId,
    lists,
    setLists
  };

  return (
    <PatientListsContext.Provider value={contextValue}>
      <Box
        sx={{
          height: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 2
        }}
      >
        <Box 
          sx={{ 
            borderRadius: 1
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Patient Lists
            </Typography>
          </Box>
          
          <Toolbar variant="dense" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                New List
              </Button>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setIsEditModalOpen(true)}
                disabled={!selectedList || selectedList.type !== 'my'}
              >
                Edit List
              </Button>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Print">
                <IconButton size="small">
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton size="small">
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Search">
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="More options">
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </Box>

        <Box sx={{ display: 'flex', flexGrow: 1, gap: 2 }}>
          <ListsSidebar />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <PatientsTable />
          </Box>
        </Box>

        <ListFormModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateList}
        />
        {selectedList && (
          <ListFormModal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditList}
            initialData={selectedList}
          />
        )}
      </Box>
    </PatientListsContext.Provider>
  );
}

export { PatientLists };
