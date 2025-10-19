import React from 'react';
import { Box, Typography } from '@mui/material';

interface TravelHistoryProps {
    flowsheet: any; // Type this properly based on your flowsheet hook return type
}

export const TravelHistory: React.FC<TravelHistoryProps> = ({ flowsheet }) => {
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Travel History
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    This tab will contain Travel History functionality.
                </Typography>
            </Box>
        </Box>
    );
};
