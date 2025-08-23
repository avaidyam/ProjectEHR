import React from 'react';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Button, Label, Window } from 'components/ui/Core.jsx';
import { usePatientLists } from 'components/contexts/PatientListContext.jsx';
  
  export const AddToListModal = ({
    open,
    onClose,
    patient,
  }) => {
    const { lists, setLists } = usePatientLists();
    const userLists = lists.filter((list) => list.type === 'my');
  
    const handleAddToList = (targetList) => {
      // Check if patient is already in the list
      if (targetList.patients.some((p) => p.id === patient.id)) {
        return;
      }
  
      // Add patient to the selected list
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === targetList.id
            ? { ...list, patients: [...list.patients, patient] }
            : list
        )
      );
  
      onClose();
    };
  
    return (
      <Window title="Add Patient to List" open={open} onClose={onClose} maxWidth='sm' fullWidth>
          <Label variant='subtitle1' gutterBottom>
            Select a list to add {patient.name}
          </Label>
          <List>
            {userLists.map((list) => (
              <ListItem key={list.id} disablePadding>
                <ListItemButton
                  onClick={() => handleAddToList(list)}
                  disabled={list.patients.some((p) => p.id === patient.id)}
                >
                  <ListItemText
                    primary={list.name}
                    secondary={
                      list.patients.some((p) => p.id === patient.id)
                        ? 'Patient already in list'
                        : undefined
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {userLists.length === 0 && (
              <ListItem>
                <ListItemText
                  primary='No lists available'
                  secondary='Create a new list first'
                />
              </ListItem>
            )}
          </List>
          <Button onClick={onClose}>Cancel</Button>
      </Window>
    );
  };
  