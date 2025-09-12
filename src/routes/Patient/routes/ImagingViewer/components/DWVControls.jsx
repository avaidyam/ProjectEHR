import React from 'react';
import { 
    Box, 
    ToggleButtonGroup, 
    ToggleButton, 
    Typography,
    Button
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

// Add the onSelectSeries prop
const DWVControls = ({ images, currentLayout, onLayoutChange, onSelectSeries }) => {
    const handleLayoutChange = (event, newLayout) => {
        if (newLayout !== null) {
            onLayoutChange(newLayout);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Top Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: 1, backgroundColor: '#f0f0f0' }}>
                <Typography variant="body1">Layout:</Typography>
                <ToggleButtonGroup
                    value={currentLayout}
                    exclusive
                    onChange={handleLayoutChange}
                    aria-label="layout options"
                    size="small"
                >
                    <ToggleButton value="1x1">1x1</ToggleButton>
                    <ToggleButton value="1x2">1x2</ToggleButton>
                    <ToggleButton value="2x2">2x2</ToggleButton>
                </ToggleButtonGroup>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="text" startIcon={<FullscreenIcon />}>Full Screen</Button>
            </Box>

            {/* Thumbnail and Slider Bar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: 1, border: '1px solid #ccc' }}>
                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, paddingBottom: 1, width: '100%' }}>
                    {images.map((series, index) => (
                        <Box 
                            key={index} 
                            onClick={() => onSelectSeries(series)}
                            sx={{
                                minWidth: 60,
                                height: 60,
                                border: '1px solid #ddd',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#000',
                            }}
                        >
                            <Typography variant="caption" color="white">{`Series ${index + 1}`}</Typography>
                        </Box>
                    ))}
                </Box>
                {/* The slider component has been removed from this component. */}
            </Box>
        </Box>
    );
};

export default DWVControls;