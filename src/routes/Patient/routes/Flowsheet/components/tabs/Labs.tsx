import React from 'react';
import { Box, Typography } from '@mui/material';

interface LabsProps {
    flowsheet: any; // Type this properly based on your flowsheet hook return type
}

export const Labs: React.FC<LabsProps> = ({ flowsheet }) => {
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Labs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    This tab will contain Labs functionality.
                </Typography>
            </Box>
        </Box>
    );
};
