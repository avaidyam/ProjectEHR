import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    Alert,
    AlertTitle,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useICD10Concept, useICD10Children, getAllCategories } from '../../../../services/icd10';
import { useSelectedDiagnoses } from '../../../contexts/SelectedDiagnosesContext';

// The diagnosis categories to fetch - using ICD-10 chapters
const DIAGNOSIS_CATEGORIES = getAllCategories();

console.log('DIAGNOSIS_CATEGORIES:', DIAGNOSIS_CATEGORIES);

const BrowseTab = ({ searchTerm = '' }) => {
    const { addDiagnosis, isDiagnosisSelected } = useSelectedDiagnoses();

    // Fetch all category concepts
    const categoryQueries = DIAGNOSIS_CATEGORIES.map(category =>
        useICD10Concept(category.conceptId)
    );

    // Fetch children for each category
    const childrenQueries = DIAGNOSIS_CATEGORIES.map(category =>
        useICD10Children(category.conceptId, {
            limit: 100
        })
    );

    // Process all data using useMemo to prevent unnecessary recalculations
    const { categoriesData, isLoading } = useMemo(() => {
        const allCategoriesLoaded = categoryQueries.every(query => !query.isLoading);
        const allChildrenLoaded = childrenQueries.every(query => !query.isLoading);

        console.log('Loading states:', {
            allCategoriesLoaded,
            allChildrenLoaded,
            categoryQueries: categoryQueries.map(q => ({ isLoading: q.isLoading, isSuccess: q.isSuccess })),
            childrenQueries: childrenQueries.map(q => ({ isLoading: q.isLoading, isSuccess: q.isSuccess }))
        });

        if (!allCategoriesLoaded || !allChildrenLoaded) {
            return {
                categoriesData: [],
                isLoading: true
            };
        }

        const processedData = DIAGNOSIS_CATEGORIES.map((category, index) => {
            const categoryQuery = categoryQueries[index];
            const childrenQuery = childrenQueries[index];

            console.log(`Processing category ${category.categoryName}:`, {
                categoryQuery: { data: categoryQuery.data, isLoading: categoryQuery.isLoading, isSuccess: categoryQuery.isSuccess },
                childrenQuery: { data: childrenQuery.data, isLoading: childrenQuery.isLoading, isSuccess: childrenQuery.isSuccess }
            });

            return {
                categoryName: category.categoryName,
                conceptId: category.conceptId,
                conceptData: categoryQuery.data,
                childrenData: childrenQuery.data || [],
                isSuccess: categoryQuery.isSuccess,
                childrenSuccess: childrenQuery.isSuccess,
                error: categoryQuery.error,
                childrenError: childrenQuery.error,
            };
        });

        console.log('Final processed data:', processedData);

        return {
            categoriesData: processedData,
            isLoading: false
        };
    }, [categoryQueries, childrenQueries]);

    const handleChildClick = (categoryName, child) => {
        console.log(`Selected diagnosis: ${child.name} from category: ${categoryName}`);

        // Add to selected diagnoses
        addDiagnosis({
            id: child.conceptId,
            name: child.name,
            fullName: child.name,
            specificity: 'Specific',
            conceptId: child.conceptId,
            term: child.name,
            source: 'browse',
            category: categoryName
        });
    };

    // Temporary debug: show raw data
    console.log('Raw queries:', { categoryQueries, childrenQueries });

    if (isLoading) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
            }}>
                {/* Professional Loading Indicator */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 4
                }}>
                    <CircularProgress
                        size={32}
                        thickness={3}
                        sx={{
                            mr: 2,
                            color: 'primary.main'
                        }}
                    />
                    <Typography
                        variant="h6"
                        color="text.primary"
                        sx={{
                            fontWeight: 400,
                            letterSpacing: '0.5px'
                        }}
                    >
                        Loading Diagnosis Categories
                    </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ width: '400px', mb: 3 }}>
                    <LinearProgress
                        sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                backgroundColor: 'primary.main'
                            }
                        }}
                    />
                </Box>

                {/* Status Text */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 400
                    }}
                >
                    Loading ICD-10 diagnosis categories...
                </Typography>
            </Box>
        );
    }

    if (!categoriesData || categoriesData.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No diagnosis categories available.
                </Typography>
            </Box>
        );
    }

    // Filter categories for search - only local filtering, no API calls
    const filteredCategories = useMemo(() => {
        return categoriesData.filter(item => {
            if (!item.isSuccess || !item.childrenSuccess) return false;

            // If no search term, show all categories
            if (!searchTerm || !searchTerm.trim()) return true;

            // Check if category has any matching diagnoses (local filtering only)
            const leafDisorders = item.childrenData || [];

            const searchLower = searchTerm.toLowerCase();
            const hasMatchingDiagnoses = leafDisorders.some(child => {
                return child.name.toLowerCase().includes(searchLower);
            });

            return hasMatchingDiagnoses;
        });
    }, [categoriesData, searchTerm]);

    // Show no results message if search yields no results
    if (searchTerm && searchTerm.trim() && filteredCategories.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No diagnoses found matching "{searchTerm}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try searching with different terms or check your spelling
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Content */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.50',
                    outline: 'none',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#c1c1c1',
                    '&:hover': {
                        backgroundColor: '#a8a8a8',
                    },
                },
            }}>
                {filteredCategories.map((category, index) => (
                    <Box key={category.conceptId} sx={{ mb: 0 }}>
                        {/* Category Header */}
                        <Box sx={{
                            p: 2,
                            borderTop: index === 0 ? 0 : 1,
                            borderRight: 1,
                            backgroundColor: 'grey.50',
                            borderBottom: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Typography variant="subtitle1" fontWeight="medium" color="primary">
                                {category.categoryName}
                            </Typography>
                            <Chip
                                label={(() => {
                                    const leafDisorders = category.childrenData || [];
                                    let count = leafDisorders.length;

                                    // Apply search filter for count
                                    if (searchTerm && searchTerm.trim()) {
                                        const searchLower = searchTerm.toLowerCase();
                                        count = leafDisorders.filter(child => {
                                            return child.name.toLowerCase().includes(searchLower);
                                        }).length;
                                    }

                                    return searchTerm && searchTerm.trim()
                                        ? `${count} matching diagnosis${count !== 1 ? 'es' : ''}`
                                        : `${count} diagnosis${count !== 1 ? 'es' : ''}`;
                                })()}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Box>

                        {/* Children List */}
                        {category.childrenData && category.childrenData.length > 0 ? (
                            <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider' }}>
                                {/* Filter to only show disorders with no children and match search term */}
                                {(() => {
                                    let leafDisorders = category.childrenData;

                                    // Apply search filter if searchTerm is provided (local filtering only)
                                    if (searchTerm && searchTerm.trim()) {
                                        const searchLower = searchTerm.toLowerCase();
                                        leafDisorders = leafDisorders.filter(child => {
                                            return child.name.toLowerCase().includes(searchLower);
                                        });
                                    }

                                    if (leafDisorders.length === 0) {
                                        return (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchTerm && searchTerm.trim()
                                                        ? 'No matching diagnoses found in this category'
                                                        : 'No diagnoses available in this category'
                                                    }
                                                </Typography>
                                            </Box>
                                        );
                                    }

                                    // Group disorders into rows of 3
                                    const rows = [];
                                    for (let i = 0; i < leafDisorders.length; i += 3) {
                                        rows.push(leafDisorders.slice(i, i + 3));
                                    }

                                    return (
                                        <Box>
                                            {rows.map((row, rowIndex) => (
                                                <Box key={rowIndex} sx={{ display: 'flex', mb: 1 }}>
                                                    {row.map((child, childIndex) => (
                                                        <Box
                                                            key={child.conceptId}
                                                            sx={{
                                                                flex: 1,
                                                                mr: childIndex < row.length - 1 ? 1 : 0,
                                                                minWidth: 0
                                                            }}
                                                        >
                                                            <Button
                                                                variant={isDiagnosisSelected(child.conceptId) ? "contained" : "text"}
                                                                size="small"
                                                                startIcon={<AddIcon fontSize="small" color={isDiagnosisSelected(child.conceptId) ? "inherit" : "primary"} />}
                                                                onClick={() => handleChildClick(category.categoryName, child)}
                                                                disabled={isDiagnosisSelected(child.conceptId)}
                                                                sx={{
                                                                    justifyContent: 'flex-start',
                                                                    textAlign: 'left',
                                                                    textTransform: 'none',
                                                                    py: 1,
                                                                    px: 1.5,
                                                                    minHeight: 'auto',
                                                                    opacity: isDiagnosisSelected(child.conceptId) ? 0.7 : 1,
                                                                    '&:hover': {
                                                                        backgroundColor: isDiagnosisSelected(child.conceptId)
                                                                            ? 'primary.main'
                                                                            : 'action.hover',
                                                                    },
                                                                }}
                                                                fullWidth
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        lineHeight: 1.1,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                    }}
                                                                >
                                                                    {child.name || 'Unknown diagnosis'}
                                                                </Typography>
                                                            </Button>
                                                        </Box>
                                                    ))}
                                                    {/* Fill empty slots in the last row to maintain alignment */}
                                                    {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, index) => (
                                                        <Box key={`empty-${index}`} sx={{ flex: 1, mr: index < 2 ? 1 : 0 }} />
                                                    ))}
                                                </Box>
                                            ))}
                                        </Box>
                                    );
                                })()}
                            </Box>
                        ) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    No diagnoses available in this category
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ))}

                {/* Failed Categories Summary */}
                {categoriesData.filter(item => !item.isSuccess || !item.childrenSuccess).length > 0 && (
                    <Alert severity="info" sx={{ my: 2, mx: 2 }}>
                        <AlertTitle>Connection Issue</AlertTitle>
                        {categoriesData.filter(item => !item.isSuccess || !item.childrenSuccess).length} categories are temporarily unavailable due to ICD-10 data loading issues.
                    </Alert>
                )}
            </Box>
        </Box>
    );
};

export default React.memo(BrowseTab, (prevProps, nextProps) => {
    // Only re-render if searchTerm changes
    return prevProps.searchTerm === nextProps.searchTerm;
}); 