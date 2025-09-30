import React from 'react';
import { Box, Typography, Button, ButtonGroup, Label, Icon } from '../../../../../components/ui/Core.jsx';

const DWVControls = ({ images, currentLayout, onLayoutChange, onSelectSeries }) => {
    const handleLayoutChange = (event, newLayout) => {
        if (newLayout !== null) {
            onLayoutChange(newLayout);
        }
    };

    const layoutOptions = ['1x1', '1x2', '2x2'];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Top Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: 1, backgroundColor: '#f0f0f0' }}>
                <Label variant="body1">Layout:</Label>
                <ButtonGroup
                    exclusive
                    aria-label="layout options"
                    size="small"
                >
                    {layoutOptions.map((layout) => (
                        <Button
                            key={layout}
                            value={layout}
                            onClick={() => handleLayoutChange(null, layout)}
                            variant={currentLayout === layout ? 'contained' : 'outlined'}
                        >
                            {layout}
                        </Button>
                    ))}
                </ButtonGroup>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="text" startIcon={<Icon>fullscreen</Icon>}>Full Screen</Button>
            </Box>

            {/* Thumbnail Bar */}
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
                            <Label variant="caption" color="white">{`Series ${index + 1}`}</Label>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default DWVControls;