import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { usePatientLists } from '../../../components/contexts/PatientListContext.jsx';
  
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
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle>Add Patient to List</DialogTitle>
        <DialogContent>
          <Typography variant='subtitle1' gutterBottom>
            Select a list to add {patient.name}
          </Typography>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  };
  