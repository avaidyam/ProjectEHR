import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const CustomNoteModal = ({ 
  open, 
  onClose, 
  onSave, 
  title = 'Edit Custom Note', 
  defaultValue = '' 
}) => {
  const [note, setNote] = useState(defaultValue);

  // Reset the note when the modal opens
  useEffect(() => {
    if (open) {
      setNote(defaultValue || '');
    }
  }, [open, defaultValue]);

  const handleSave = () => {
    onSave(note); // Pass the note back to the parent
    onClose(); // Close the modal
  };

  const handleCancel = () => {
    setNote(''); // Clear the note
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={4}
          maxRows={10}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type your custom note here..."
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomNoteModal;
