import { Box, Button, Container, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ListsSidebar } from '../../features/patients-list/components/ListsSidebar';
import { PatientsTable } from '../../features/patients-list/components/PatientsTable';
import {
    CreateListModal,
} from '../../features/patients-list/components/CreateListModal';

// Create a context for patient lists data
export const PatientListsContext = createContext();

// Custom hook to use the patient lists context
export const usePatientLists = () => useContext(PatientListsContext);

function PatientLists() {
  const [searchParams, setSearchParams] = useSearchParams();
  const listId = searchParams.get('listId');
  const [selectedListId, setSelectedListId] = useState(null);
  const [lists, setLists] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Update the selected list ID when the URL changes
  useEffect(() => {
    setSelectedListId(listId || null);
  }, [listId]);

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

    // Navigate to the newly created list
    setSearchParams({ listId: newList.id });
  };

  // Create the context value object with all the state and functions
  const contextValue = {
    selectedListId,
    setSelectedListId: (id) => {
      if (id) {
        setSearchParams({ listId: id });
      } else {
        setSearchParams({});
      }
    },
    lists,
    setLists
  };

  return (
    <PatientListsContext.Provider value={contextValue}>
      <Container
        maxWidth={false}
        sx={{
          height: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Patient Lists</Typography>
          <Box>
            <Button 
              variant="contained" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New List
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, mt: 2 }}>
          <ListsSidebar />
          <Box sx={{ flexGrow: 1 }}>
            <PatientsTable />
          </Box>
        </Box>
        <CreateListModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateList={handleCreateList}
        />
      </Container>
    </PatientListsContext.Provider>
  );
}

export { PatientLists };
