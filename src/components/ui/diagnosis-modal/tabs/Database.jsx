import React, { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    AlertTitle,
    Button,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Check as CheckIcon } from '@mui/icons-material';
import { useICD10InfiniteSearch } from '../../../../services/icd10';
import { useSelectedDiagnoses } from '../../../contexts/SelectedDiagnosesContext';

const DiagnosisDatabaseTab = ({ searchTerm }) => {
    const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);
    const { addDiagnosis, isDiagnosisSelected } = useSelectedDiagnoses();

    // Only search if we have a debounced search term with at least 3 characters
    const shouldSearch = debouncedSearchTerm && debouncedSearchTerm.trim().length >= 3;

    const {
        data,
        isLoading,
        error,
        isSuccess,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage
    } = useICD10InfiniteSearch(
        shouldSearch ? debouncedSearchTerm : '', // Pass empty string if shouldn't search
        { limit: 100 }
    );

    // Process all pages of search results
    const { processedSearchResults, totalElements } = useMemo(() => {
        if (isSuccess && data?.pages) {
            // Flatten all pages and transform the data
            const allItems = data.pages.flatMap(page => page.items || []);
            const results = allItems.map((item, index) => ({
                id: `${item.concept?.conceptId || item.conceptId}-${index}`, // Make unique with index
                name: item.concept?.pt?.term || item.term || 'Unknown',
                fullName: item.concept?.fsn?.term || item?.fsn || 'Unknown',
                specificity: item.concept?.isLeafInferred ? 'Specific' : 'Generic',
                conceptId: item.concept?.conceptId || item.conceptId,
                term: item.term, // The actual search term that matched
            }));

            // Get total from the first page
            const totalElements = data.pages[0]?.totalElements || 0;

            return {
                processedSearchResults: results,
                totalElements
            };
        }

        return {
            processedSearchResults: [],
            totalElements: 0
        };
    }, [isSuccess, data]);

    const renderEmptyState = () => {
        if (!searchTerm || searchTerm.trim().length < 3) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Search for a Diagnosis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter at least 3 characters to find diagnoses
                    </Typography>
                </Box>
            );
        }

        return null;
    };

    const renderContent = () => {
        // Show empty state if search term is less than 3 characters
        if (!searchTerm || searchTerm.trim().length < 3) {
            return renderEmptyState();
        }

        // Show loading immediately when user types 3+ characters, even before debounce completes
        if (isLoading || (!shouldSearch && searchTerm.trim().length >= 3)) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Searching for "{searchTerm}"...
                    </Typography>
                </Box>
            );
        }

        if (error) {
            return (
                <Box sx={{ p: 2 }}>
                    <Alert severity="info" sx={{ mx: 2 }}>
                        <AlertTitle>Connection Issue</AlertTitle>
                        Database search is temporarily unavailable due to ICD-10 data loading issues.
                    </Alert>
                </Box>
            );
        }

        if (processedSearchResults.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No diagnoses found for "{debouncedSearchTerm}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try a different search term or check your spelling
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper} sx={{ borderRadius: 0, borderRight: 1, borderColor: 'divider' }} elevation={0}>
                <Table>
                    {/* TableHead commented out for now
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                Name
                            </TableCell>
                            <TableCell sx={{ width: 60, textAlign: 'center' }}>
                                Empty header for add button column
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    */}
                    <TableBody>
                        {processedSearchResults.map((result) => (
                            <TableRow
                                key={result.id}
                                hover={!isDiagnosisSelected(result.conceptId)}
                                sx={{
                                    backgroundColor: isDiagnosisSelected(result.conceptId) ? 'action.disabledBackground' : 'inherit',
                                    opacity: isDiagnosisSelected(result.conceptId) ? 0.5 : 1,
                                    '&:hover': {
                                        backgroundColor: isDiagnosisSelected(result.conceptId)
                                            ? 'action.disabledBackground'
                                            : 'action.hover'
                                    }
                                }}
                            >
                                <TableCell>
                                    <Typography variant="body2">
                                        {result.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ID: {result.conceptId}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <Tooltip title="Add to Problem List">
                                        <IconButton
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent row click
                                                if (!isDiagnosisSelected(result.conceptId)) {
                                                    addDiagnosis({
                                                        ...result,
                                                        source: 'database'
                                                    });
                                                }
                                            }}
                                            disabled={isDiagnosisSelected(result.conceptId)}
                                        >
                                            {isDiagnosisSelected(result.conceptId) ? (
                                                <CheckIcon />
                                            ) : (
                                                <AddIcon />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table >
            </TableContainer >
        );
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <Typography variant="h6" component="h2">
                    Diagnoses
                </Typography>
                {shouldSearch && (
                    <Typography variant="body2" color="text.secondary">
                        Search results for "{debouncedSearchTerm}"
                    </Typography>
                )}
            </Box>

            {/* Content */}
            <Box sx={{
                flexGrow: 1,
                width: '100%',
                maxWidth: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                minWidth: 0, // Critical for flex child to shrink
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
            }}>
                {renderContent()}

                {/* Pagination and Total Count */}
                {shouldSearch && processedSearchResults.length > 0 && (
                    <Box sx={{
                        p: 2,
                        backgroundColor: 'grey.50',
                        width: '100%',
                        maxWidth: '100%',
                        borderRight: 1,
                        borderColor: 'divider',
                        minWidth: 0
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            minWidth: 0
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                Showing {processedSearchResults.length} of {totalElements} results
                            </Typography>

                            {hasNextPage && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleLoadMore}
                                    disabled={isLoading || isFetchingNextPage}
                                    sx={{ minWidth: 120 }}
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <CircularProgress size={16} sx={{ mr: 1 }} />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More'
                                    )}
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default React.memo(DiagnosisDatabaseTab); 