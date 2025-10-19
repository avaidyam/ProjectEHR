import React from 'react';
import { Box, Typography } from '@mui/material';

interface VsPtReportedProps {
    flowsheet: any; // Type this properly based on your flowsheet hook return type
}

export const VsPtReported: React.FC<VsPtReportedProps> = ({ flowsheet }) => {
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    VS/PT Reported
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    This tab will contain VS/PT Reported functionality.
                </Typography>
            </Box>
        </Box>
    );
};
