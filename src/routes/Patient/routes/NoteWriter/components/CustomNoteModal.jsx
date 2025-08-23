import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Window } from 'components/ui/Core.jsx';

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
    <Window title={title} open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </Box>
    </Window>
  );
};

export default CustomNoteModal;
