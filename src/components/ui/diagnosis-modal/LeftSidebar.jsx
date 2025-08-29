import React from 'react';
import { Box, Typography } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useSelectedDiagnoses } from '../../contexts/SelectedDiagnosesContext';
import { usePreferenceLists } from '../../contexts/PreferenceListContext';

const DiagnosisLeftSidebar = () => {
    const { addDiagnosis, removeDiagnosis, isDiagnosisSelected } = useSelectedDiagnoses();
    const { preferenceListsData } = usePreferenceLists();

    const handleDiagnosisClick = (diagnosis) => {
        if (isDiagnosisSelected(diagnosis.conceptId)) {
            // If already selected, remove it
            removeDiagnosis(diagnosis.conceptId);
        } else {
            // If not selected, add it
            addDiagnosis({
                ...diagnosis,
                source: 'preference-list'
            });
        }
    };

    const renderTreeItems = (items) => {
        return items.map((item) => (
            <TreeItem
                key={item.id}
                itemId={item.id}
                label={item.label}
            >
                {item.children && renderTreeItems(item.children)}
                {item.diagnoses && item.diagnoses.map((diagnosis, diagnosisIndex) => (
                    <TreeItem
                        key={`${item.id}-diagnosis-${diagnosisIndex}-${diagnosis.conceptId || diagnosisIndex}`}
                        itemId={`${item.id}-diagnosis-${diagnosisIndex}-${diagnosis.conceptId || diagnosisIndex}`}
                        label={diagnosis.name}
                        onClick={() => handleDiagnosisClick(diagnosis)}
                    />
                ))}
            </TreeItem>
        ));
    };

    return (
        <Box
            sx={{
                width: 250,
                minWidth: 250,
                maxWidth: 250,
                flexShrink: 0,
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, // Important for flexbox scrolling
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Typography variant="subtitle2">
                    Preference Lists
                </Typography>
            </Box>

            {/* Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    p: 1,
                    minHeight: 0,
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'grey.50',
                        outline: 'none', // Remove outline from track
                        borderLeft: '1px solid',
                        borderColor: 'divider',
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
                <SimpleTreeView defaultExpandedItems={['personal', 'organizational']}>
                    {renderTreeItems(preferenceListsData)}
                </SimpleTreeView>
            </Box>
        </Box>
    );
};

export default DiagnosisLeftSidebar; 