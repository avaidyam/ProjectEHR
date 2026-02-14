import * as React from 'react';
import { Box, Button, Window, Autocomplete } from 'components/ui/Core';

interface PromptDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  placeholder?: string;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({ open, onClose, onConfirm, title, placeholder = '' }) => {
  const [inputValue, setInputValue] = React.useState('');

  // Reset input value whenever the dialog opens
  React.useEffect(() => {
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
      <Autocomplete
        freeSolo
        autoFocus
        fullWidth
        placeholder={placeholder}
        value={inputValue}
        onInputChange={(_e, newValue) => setInputValue(newValue)}
        onKeyDown={handleKeyPress} // Listen for Enter key
        options={[]}
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
