import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const PromptDialog = ({ open, onClose, onConfirm, title, placeholder = '' }) => {
  const [inputValue, setInputValue] = useState('');

  // Reset input value whenever the dialog opens
  useEffect(() => {
    if (open) {
      setInputValue('');
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(inputValue);
    onClose();
  };

  const handleCancel = () => {
    setInputValue(''); // Reset the input value
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{title || 'Enter a Value'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress} // Listen for Enter key
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptDialog;
