import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Button,
    Chip,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { useSelectedDiagnoses } from '../../contexts/SelectedDiagnosesContext';

const DiagnosisRightSidebar = () => {
    const { selectedDiagnoses, removeDiagnosis, clearAllDiagnoses, count } = useSelectedDiagnoses();

    return (
        <Box
            sx={{
                width: 250,
                minWidth: 250,
                maxWidth: 250,
                flexShrink: 0,
                borderLeft: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, // Important for flexbox to work properly
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0, backgroundColor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Problems ({count})
                </Typography>
            </Box>

            {/* Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'grey.50',
                        outline: 'none', // Remove outline from track
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#c1c1c1',
                        '&:hover': {
                            backgroundColor: '#a8a8a8',
                        },
                    },
                }}
                onWheel={(e) => e.stopPropagation()}
            >
                {count === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No diagnoses selected
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ px: 1 }}>
                        {selectedDiagnoses.map((diagnosis, index) => (
                            <Box key={diagnosis.conceptId}>
                                <Box sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    // '&:hover': {
                                    //     backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    // }
                                }}>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}
                                        >
                                            {diagnosis.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: 'block',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            ID: {diagnosis.conceptId}
                                        </Typography>

                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => removeDiagnosis(diagnosis.conceptId)}
                                        sx={{ ml: 1, flexShrink: 0 }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                {index < selectedDiagnoses.length - 1 && (
                                    <Divider sx={{ mx: 1 }} />
                                )}
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Footer - Clear All Button */}
            {count > 0 && (
                <Box sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                    backgroundColor: 'background.paper',
                }}>
                    <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<ClearAllIcon />}
                        onClick={clearAllDiagnoses}
                        color="error"
                    >
                        Clear All ({count})
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default DiagnosisRightSidebar; 