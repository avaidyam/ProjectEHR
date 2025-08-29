import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    TextField,
    Button,
    Tabs,
    Tab,
    IconButton,
    AppBar,
    Toolbar,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    Close as CloseIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    Search as SearchIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    ViewQuilt as ViewQuiltIcon,
} from '@mui/icons-material';
import RideSidebar from './RideSidebar';
import LeftSidebar from './LeftSidebar';
import DiagnosisSearchInput from './SearchInput';
import TabContentWrapper from './TabContentWrapper';
import { SelectedDiagnosesProvider } from '../../contexts/SelectedDiagnosesContext';
import { PreferenceListProvider } from '../../contexts/PreferenceListContext';

const DiagnosesSearchModal = ({ open, onClose }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'detailed'

    // Get active tab from URL or default to 0 (Browse)
    const activeTab = parseInt(searchParams.get('tab') || '0');

    const handleClose = () => {
        // Remove tab and search parameters when closing
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tab');
        newSearchParams.delete('search');
        setSearchParams(newSearchParams, { replace: true });
        onClose();
    };

    const handleFullscreenToggle = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleTabChange = (event, newValue) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', newValue.toString());
        // Clear search when changing tabs
        newParams.delete('search');
        setSearchParams(newParams, { replace: true });
    };

    const handleViewModeChange = (event, newViewMode) => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
        }
    };

    const handleAccept = () => {
        // TODO: Implement accept functionality
        handleClose();
    };

    const handleCancel = () => {
        handleClose();
    };

    return (
        <PreferenceListProvider>
            <SelectedDiagnosesProvider>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="xl"
                    fullWidth
                    fullScreen={isFullscreen}
                    slotProps={{
                        paper: {
                            sx: {
                                minHeight: isFullscreen ? '100vh' : '80vh',
                                maxHeight: isFullscreen ? '100vh' : '90vh',
                                maxWidth: isFullscreen ? '100vw' : '1200px', // Fixed maximum width
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            },
                        },
                    }}
                >
                    {/* Header Section */}
                    <AppBar position="static" color="default" elevation={0}>
                        <Toolbar variant="dense" sx={{ boxShadow: 'none' }}>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                Diagnoses Search
                            </Typography>

                            {/* Window Controls */}
                            <IconButton
                                edge="end"
                                color="inherit"
                                onClick={handleFullscreenToggle}
                                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            >
                                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                            </IconButton>
                            <IconButton
                                edge="end"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Toolbar>

                        {/* Search and Tabs Section */}
                        <Box sx={{ px: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                {/* Search input with tab-specific behavior */}
                                <DiagnosisSearchInput />
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    variant="standard"
                                    sx={{ borderColor: 'divider' }}
                                >
                                    <Tab label="Browse" />
                                    <Tab label="Preference List" />
                                    <Tab label="Database" />
                                </Tabs>
                            </Box>
                        </Box>
                    </AppBar>

                    {/* Main Content Area */}
                    <DialogContent sx={{
                        p: 0,
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: 1,
                        minHeight: 0, // Important for flexbox to work properly
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '100%'
                    }}>
                        {/* Left Sidebar */}
                        <LeftSidebar />

                        {/* Main Content */}
                        <Box
                            sx={{
                                flexGrow: 1,
                                flexShrink: 1,
                                minWidth: 0, // Critical: allows flex item to shrink below content size
                                width: 'calc(100% - 500px)', // Explicit width: total - (250px + 250px)
                                maxWidth: 'calc(100% - 500px)',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0, // Important for flexbox to work properly
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header - Only show on Browse tab */}
                            {activeTab === 0 && (
                                <Box
                                    sx={{
                                        backgroundColor: 'grey.50',
                                        p: 2,
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                    >
                                        Medical History
                                    </Typography>

                                    {/* View Toggle Buttons */}
                                    <ToggleButtonGroup
                                        value={viewMode}
                                        exclusive
                                        onChange={handleViewModeChange}
                                        size="small"
                                        sx={{
                                            ml: 2,
                                            my: -2,
                                            '& .MuiToggleButton-root': {
                                                padding: '4px6px',
                                                minWidth: 'auto',
                                            }
                                        }}
                                    >
                                        <ToggleButton value="grid" aria-label="grid view">
                                            <ViewModuleIcon sx={{ fontSize: '12px' }} />
                                        </ToggleButton>
                                        <ToggleButton value="list" aria-label="list view">
                                            <ViewListIcon sx={{ fontSize: '12px' }} />
                                        </ToggleButton>
                                        <ToggleButton value="detailed" aria-label="detailed view">
                                            <ViewQuiltIcon sx={{ fontSize: '12px' }} />
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            )}

                            <Box
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#1976d2', // Primary blue color
                                        borderRadius: '4px',
                                        '&:hover': {
                                            backgroundColor: '#1565c0', // Darker blue on hover
                                        },
                                    },
                                }}
                                onWheel={(e) => e.stopPropagation()}
                            >
                                {/* Render only the active tab component with search term */}
                                <TabContentWrapper />
                            </Box>
                        </Box>

                        {/* Right Sidebar */}
                        <RideSidebar />
                    </DialogContent>

                    {/* Footer */}
                    <Divider />
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button variant="outlined" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleAccept}>
                            Accept
                        </Button>
                    </Box>
                </Dialog>
            </SelectedDiagnosesProvider>
        </PreferenceListProvider>
    );
};

export default DiagnosesSearchModal; 