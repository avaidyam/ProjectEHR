import React, { useState } from 'react';
import { Popover } from '@mui/material';
import { Box, Label, Button, Icon, Stack, IconButton, Menu } from '../../../../components/ui/Core.jsx';
import { DWVViewer } from './components/DWVViewer.jsx';

export const ImagingTabContent = ({ data, viewerId, convertMonochrome }) => {
    const basePath = './img/Anonymized_20240903/series-00001/';
    const dicomFiles = Array.from({ length: 21 }, (_, i) => `${basePath}image-${String(i).padStart(5, '0')}.dcm`);
    const images = data?.image ? [data?.image] : dicomFiles;

    const [currentLayout, setCurrentLayout] = useState('1x1'); // "rows x cols"
    const [currentImageSet, setCurrentImageSet] = useState(images);
    const [layoutAnchorEl, setLayoutAnchorEl] = useState(null);
    const [hoverLayout, setHoverLayout] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedTool, setSelectedTool] = useState('Scroll');

    const openLayoutMenu = (event) => {
        setLayoutAnchorEl(event.currentTarget);
    };

    const closeLayoutMenu = () => {
        setLayoutAnchorEl(null);
        setHoverLayout(null);
    };

    const handleGridHover = (rows, cols) => {
        setHoverLayout(`${rows}x${cols}`);
    };

    const handleGridSelect = (rows, cols) => {
        setCurrentLayout(`${rows}x${cols}`);
        closeLayoutMenu();
    };

    // Parse layout "RxC"
    const [currentRows, currentCols] = (currentLayout || '1x1').split('x').map(Number);
    const numViewers = currentRows * currentCols;

    const handleSeriesSelection = (seriesFiles) => {
        setCurrentImageSet(seriesFiles);
    };

    const handleContextMenu = (event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null,
        );
    };

    const handleMenuToolChange = (tool) => {
        setSelectedTool(tool);
        setContextMenu(null);
    };

    return (
        <Box elevation={3} sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#000', color: '#fff' }}>
                {/* Top Toolbar */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    padding: '8px 16px',
                    backgroundColor: '#1c1c1c',
                    borderBottom: '1px solid #333'
                }}>
                    {/* Study Info */}
                    <Stack spacing={0}>
                        <Label variant="subtitle2" bold sx={{ color: '#fff', lineHeight: 1.2 }}>{data?.date}</Label>
                        <Label variant="body2" sx={{ color: '#ccc', textTransform: 'uppercase', fontSize: '0.75rem' }}>{data?.test}</Label>
                    </Stack>

                    <Box sx={{ width: '1px', height: '32px', bgcolor: '#444', mx: 1 }} />

                    {/* Layout & Stack Controls */}
                    <Stack direction="row" spacing={1}>
                        <IconButton onClick={openLayoutMenu}><Icon sx={{ color: '#aaa' }}>grid_view</Icon></IconButton>
                        <Menu
                            anchorEl={layoutAnchorEl}
                            open={Boolean(layoutAnchorEl)}
                            onClose={closeLayoutMenu}
                            PaperProps={{
                                sx: { bgcolor: '#1c1c1c', color: '#fff', border: '1px solid #333', p: 1 }
                            }}
                        >
                            <Box sx={{ padding: 1, minWidth: 150 }}>
                                <Label variant="subtitle2" sx={{ mb: 1, textAlign: 'center', color: '#ccc' }}>
                                    {hoverLayout || currentLayout}
                                </Label>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                                        <Box key={rowIndex} sx={{ display: 'flex', gap: 0.5 }}>
                                            {Array.from({ length: 6 }).map((_, colIndex) => {
                                                const r = rowIndex + 1;
                                                const c = colIndex + 1;

                                                // Determine highlight state based on hover or current selection
                                                const [hoverR, hoverC] = (hoverLayout || currentLayout).split('x').map(Number);
                                                const isActive = r <= hoverR && c <= hoverC;

                                                return (
                                                    <Box
                                                        key={`${rowIndex}-${colIndex}`}
                                                        onMouseEnter={() => handleGridHover(r, c)}
                                                        onClick={() => handleGridSelect(r, c)}
                                                        sx={{
                                                            width: 20,
                                                            height: 20,
                                                            border: isActive ? '1px solid #4dabf5' : '1px solid #555',
                                                            bgcolor: isActive ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(33, 150, 243, 0.4)'
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Menu>
                        <IconButton><Icon sx={{ color: '#aaa' }}>layers</Icon></IconButton>
                    </Stack>

                    <Box sx={{ width: '1px', height: '32px', bgcolor: '#444', mx: 1 }} />

                    {/* Navigation Controls */}
                    <Stack direction="row" spacing={1}>
                        <IconButton disabled><Icon sx={{ color: '#aaa' }}>skip_previous</Icon></IconButton>
                        <IconButton disabled><Icon sx={{ color: '#aaa' }}>play_arrow</Icon></IconButton>
                        <IconButton disabled><Icon sx={{ color: '#aaa' }}>skip_next</Icon></IconButton>
                    </Stack>

                    <Box sx={{ width: '1px', height: '32px', bgcolor: '#444', mx: 1 }} />

                    {/* Study Actions */}
                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<Icon>arrow_drop_down</Icon>}
                        sx={{
                            borderColor: '#444',
                            color: '#ccc',
                            textTransform: 'none',
                            '&:hover': { borderColor: '#666', bgcolor: '#333' }
                        }}
                    >
                        Study Actions
                    </Button>
                </Box>

                {/* Thumbnail Strip */}
                <Box sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 0.5,
                    padding: 0.5,
                    backgroundColor: '#000',
                    '&::-webkit-scrollbar': { height: '8px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#444', borderRadius: '4px' }
                }}>
                    {images.map((series, index) => {
                        const isSelected = index === 0; // Mock selection for visual reference

                        return (
                            <Box
                                key={index}
                                onClick={() => handleSeriesSelection(images.length === 1 ? [series] : series)}
                                sx={{
                                    minWidth: 100,
                                    height: 100,
                                    position: 'relative',
                                    border: isSelected ? '2px solid #2196f3' : '1px solid #333',
                                    cursor: 'pointer',
                                    backgroundColor: '#111',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    '&:hover': { borderColor: '#666' }
                                }}
                            >
                                {/* Simulate Image Content */}
                                <Icon sx={{ color: '#333', fontSize: 40 }}>image</Icon>

                                {/* Overlays */}
                                <Box sx={{ position: 'absolute', top: 2, left: 4, zIndex: 1 }}>
                                    <Label variant="caption" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.7rem' }}>CT</Label>
                                </Box>
                                <Box sx={{ position: 'absolute', top: 2, right: 4, zIndex: 1 }}>
                                    <Label variant="caption" sx={{ color: '#fff', fontSize: '0.7rem' }}>{Math.floor(Math.random() * 200) + 1}</Label>
                                </Box>
                                <Box sx={{ position: 'absolute', bottom: 2, left: 4, zIndex: 1 }}>
                                    <Label variant="caption" sx={{ color: '#aaa', fontSize: '0.65rem' }}>S{index + 1}</Label>
                                </Box>
                                <Box sx={{ position: 'absolute', bottom: 2, right: 4, zIndex: 1 }}>
                                    <Label variant="caption" sx={{ color: '#fff', fontSize: '0.65rem' }}>{Math.floor(Math.random() * 100)}%</Label>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Box sx={{
                flexGrow: 1,
                width: '100%',
                display: 'grid',
                gridTemplateRows: `repeat(${currentRows}, 1fr)`,
                gridTemplateColumns: `repeat(${currentCols}, 1fr)`,
                gap: '1px',
                bgcolor: '#333' // Gap color
            }}>
                {Array.from({ length: numViewers }).map((_, index) => (
                    <Box
                        key={index}
                        onContextMenu={handleContextMenu}
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: '#000',
                            overflow: 'hidden'
                        }}
                    >
                        <DWVViewer
                            images={currentImageSet}
                            viewerId={`${viewerId}-${index}`}
                            convertMonochrome={convertMonochrome}
                            tool={selectedTool}
                        />
                    </Box>
                ))}
            </Box>
            <Popover
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                PaperProps={{
                    sx: {
                        bgcolor: '#1c1c1c',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: 1,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                        p: 1
                    }
                }}
            >
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    <IconButton onClick={() => handleMenuToolChange('WindowLevel')}>
                        <Icon sx={{ color: '#ccc' }}>brightness_6</Icon>
                    </IconButton>
                    <IconButton onClick={() => handleMenuToolChange('ZoomAndPan')}>
                        <Icon sx={{ color: '#ccc' }}>search</Icon>
                    </IconButton>
                    <IconButton onClick={() => handleMenuToolChange('ZoomAndPan')}>
                        <Icon sx={{ color: '#ccc' }}>open_with</Icon>
                    </IconButton>

                    <IconButton onClick={() => handleMenuToolChange('Draw')}>
                        <Icon sx={{ color: '#ccc' }}>straighten</Icon>
                    </IconButton>
                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>architecture</Icon>
                    </IconButton>
                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>collections</Icon>
                    </IconButton>

                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>timeline</Icon>
                    </IconButton>
                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>share</Icon>
                    </IconButton>
                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>view_week</Icon>
                    </IconButton>

                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>gesture</Icon>
                    </IconButton>
                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>control_camera</Icon>
                    </IconButton>
                    <IconButton>
                        <Icon sx={{ color: '#ccc' }}>refresh</Icon>
                    </IconButton>
                </Box>
            </Popover>
        </Box>
    );
};

export default ImagingTabContent;