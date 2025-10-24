import React from 'react';
import { Box, Button } from '@mui/material';

interface TopAppBarProps {
  // No props needed for now
}

export const TopAppBar: React.FC<TopAppBarProps> = () => {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
      {/* Title only */}
      <Button variant="text" sx={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'none' }}>
        Flowsheets
      </Button>
    </Box>
  );
};