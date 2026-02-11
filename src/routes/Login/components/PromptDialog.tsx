import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Window } from 'components/ui/Core';

interface PromptDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  placeholder?: string;
}

const PromptDialog: React.FC<PromptDialogProps> = ({ open, onClose, onConfirm, title, placeholder = '' }) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Window title={title || 'Enter a Value'} open={open} onClose={handleCancel}>
      <TextField
        autoFocus
        fullWidth
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress} // Listen for Enter key
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Confirm
        </Button>
      </Box>
    </Window>
  );
};

export default PromptDialog;
