import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Chip,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { usePreferenceLists } from '../../../contexts/PreferenceListContext';

const PreferenceListTab = ({ searchTerm = '' }) => {
    const {
        getAllPreferenceLists,
        removeFromPreferenceList,
        isFavorite,
        toggleFavorite
    } = usePreferenceLists();

    const preferenceLists = getAllPreferenceLists;

    // Get search results grouped by category
    const getSearchResults = () => {
        if (!searchTerm) return [];

        const results = [];

        preferenceLists.forEach(list => {
            const matchingDiagnoses = list.diagnoses.filter(diagnosis =>
                diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                list.label.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (matchingDiagnoses.length > 0) {
                results.push({
                    ...list,
                    diagnoses: matchingDiagnoses
                });
            }
        });

        return results;
    };

    const searchResults = getSearchResults();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                flexGrow: 1, overflow: 'auto', '&::-webkit-scrollbar': {
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
            }}>
                {searchTerm ? (
                    /* Search Results */
                    <Box>
                        {searchResults.length === 0 ? (
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary="No results found"
                                        secondary="Try a different search term"
                                    />
                                </ListItem>
                            </List>
                        ) : (
                            searchResults.map((list) => (
                                <Box key={list.id}>
                                    {/* List Header */}
                                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                                        <Typography variant="subtitle2">
                                            {list.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {list.type === 'organizational' ? 'Organizational' : 'Personal'} • {list.diagnoses.length} matching items
                                        </Typography>
                                    </Box>

                                    {/* List Items */}
                                    <List>
                                        {list.diagnoses.map((diagnosis) => {
                                            const isFav = isFavorite(diagnosis.conceptId);
                                            return (
                                                <ListItem key={diagnosis.conceptId}>
                                                    <ListItemIcon>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleFavorite(diagnosis.conceptId)}
                                                        >
                                                            {isFav ? <StarIcon color="primary" /> : <StarBorderIcon />}
                                                        </IconButton>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={diagnosis.name}
                                                        secondary={`ID: ${diagnosis.conceptId}`}
                                                    />
                                                    {list.type === 'personal' && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeFromPreferenceList(list.id, diagnosis.conceptId)}
                                                            title="Remove from list"
                                                        >
                                                            <AddIcon sx={{ transform: 'rotate(45deg)' }} />
                                                        </IconButton>
                                                    )}
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                    <Divider />
                                </Box>
                            ))
                        )}
                    </Box>
                ) : (
                    /* Preference Lists */
                    <Box>
                        {preferenceLists.map((list) => (
                            <Box key={list.id}>
                                {/* List Header */}
                                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                                    <Typography variant="subtitle2">
                                        {list.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {list.type === 'organizational' ? 'Organizational' : 'Personal'} • {list.diagnoses.length} items
                                    </Typography>
                                </Box>

                                {/* List Items */}
                                <List>
                                    {list.diagnoses.length === 0 ? (
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                        No diagnoses in this list
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ) : (
                                        list.diagnoses.map((diagnosis) => {
                                            const isFav = isFavorite(diagnosis.conceptId);
                                            return (
                                                <ListItem key={diagnosis.conceptId}>
                                                    <ListItemIcon>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleFavorite(diagnosis.conceptId)}
                                                        >
                                                            {isFav ? <StarIcon color="primary" /> : <StarBorderIcon />}
                                                        </IconButton>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={diagnosis.name}
                                                        secondary={`ID: ${diagnosis.conceptId}`}
                                                    />
                                                    {list.type === 'personal' && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeFromPreferenceList(list.id, diagnosis.conceptId)}
                                                            title="Remove from list"
                                                        >
                                                            <AddIcon sx={{ transform: 'rotate(45deg)' }} />
                                                        </IconButton>
                                                    )}
                                                </ListItem>
                                            );
                                        })
                                    )}
                                </List>
                                <Divider />
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PreferenceListTab; 