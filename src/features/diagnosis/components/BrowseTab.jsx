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
import { useSnowmedConcept, useSnowmedChildren } from '../../../services/snowmed';
import { useSelectedDiagnoses } from './SelectedDiagnosesContext';

// The diagnosis categories to fetch
const DIAGNOSIS_CATEGORIES = [
    {
        "categoryName": "Allergies/Immunology",
        "conceptId": "414029004"
    },
    {
        "categoryName": "Blood/Circulatory",
        "conceptId": "414022008"
    },
    {
        "categoryName": "Cardiovascular",
        "conceptId": "49601007"
    },
    {
        "categoryName": "Congenital",
        "conceptId": "414025005"
    },
    {
        "categoryName": "Dermatology",
        "conceptId": "80659006"
    },
    {
        "categoryName": "Endocrine/Metabolic",
        "conceptId": "362969004"
    },
    {
        "categoryName": "Gastrointestinal",
        "conceptId": "119292006"
    },
    {
        "categoryName": "Infectious Disease",
        "conceptId": "40733004"
    },
    {
        "categoryName": "Mental Health",
        "conceptId": "74732009"
    },
    {
        "categoryName": "Musculoskeletal",
        "conceptId": "928000"
    },
    {
        "categoryName": "Neurology",
        "conceptId": "118940003"
    },
    {
        "categoryName": "Oncology (Cancers)",
        "conceptId": "399981008"
    },
    {
        "categoryName": "Respiratory",
        "conceptId": "50043002"
    },
    {
        "categoryName": "Urology/Nephrology",
        "conceptId": "42030000"
    }
];

const BrowseTab = ({ searchTerm = '' }) => {
    const { addDiagnosis, isDiagnosisSelected } = useSelectedDiagnoses();

    // Fetch all category concepts
    const categoryQueries = DIAGNOSIS_CATEGORIES.map(category =>
        useSnowmedConcept(category.conceptId)
    );

    // Fetch children for each category
    const childrenQueries = DIAGNOSIS_CATEGORIES.map(category =>
        useSnowmedChildren(category.conceptId, {
            limit: 100,
            form: 'inferred'
        })
    );

    // Process all data using useMemo to prevent unnecessary recalculations
    const { categoriesData, isLoading } = useMemo(() => {
        const allCategoriesLoaded = categoryQueries.every(query => !query.isLoading);
        const allChildrenLoaded = childrenQueries.every(query => !query.isLoading);

        if (!allCategoriesLoaded || !allChildrenLoaded) {
            return {
                categoriesData: [],
                isLoading: true
            };
        }

        const processedData = DIAGNOSIS_CATEGORIES.map((category, index) => {
            const categoryQuery = categoryQueries[index];
            const childrenQuery = childrenQueries[index];

            return {
                categoryName: category.categoryName,
                conceptId: category.conceptId,
                conceptData: categoryQuery.data,
                childrenData: childrenQuery.data,
                isSuccess: categoryQuery.isSuccess,
                childrenSuccess: childrenQuery.isSuccess,
                error: categoryQuery.error,
                childrenError: childrenQuery.error,
            };
        });

        return {
            categoriesData: processedData,
            isLoading: false
        };
    }, [categoryQueries, childrenQueries]);

    const handleChildClick = (categoryName, child) => {
        console.log(`Selected diagnosis: ${child.pt?.term || child.fsn?.term} from category: ${categoryName}`);

        // Add to selected diagnoses
        addDiagnosis({
            id: child.conceptId,
            name: child.pt?.term || child.fsn?.term || 'Unknown',
            fullName: child.fsn?.term || 'Unknown',
            specificity: child.isLeafInferred ? 'Specific' : 'Generic',
            conceptId: child.conceptId,
            term: child.pt?.term || child.fsn?.term,
            source: 'browse',
            category: categoryName
        });
    };

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
                    Connecting to SNOMED CT terminology server...
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
    const filteredCategories = categoriesData.filter(item => {
        if (!item.isSuccess || !item.childrenSuccess) return false;

        // If no search term, show all categories
        if (!searchTerm || !searchTerm.trim()) return true;

        // Check if category has any matching diagnoses (local filtering only)
        const leafDisorders = item.childrenData?.items?.filter(child =>
            child.descendantCount === 0 || child.descendantCount === undefined
        ) || [];

        const searchLower = searchTerm.toLowerCase();
        const hasMatchingDiagnoses = leafDisorders.some(child => {
            const ptTerm = child.pt?.term?.toLowerCase() || '';
            const fsnTerm = child.fsn?.term?.toLowerCase() || '';
            return ptTerm.includes(searchLower) || fsnTerm.includes(searchLower);
        });

        return hasMatchingDiagnoses;
    });

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
                                    let leafDisorders = category.childrenData?.items?.filter(child =>
                                        child.descendantCount === 0 || child.descendantCount === undefined
                                    ) || [];

                                    // Apply search filter for count
                                    if (searchTerm && searchTerm.trim()) {
                                        const searchLower = searchTerm.toLowerCase();
                                        leafDisorders = leafDisorders.filter(child => {
                                            const ptTerm = child.pt?.term?.toLowerCase() || '';
                                            const fsnTerm = child.fsn?.term?.toLowerCase() || '';
                                            return ptTerm.includes(searchLower) || fsnTerm.includes(searchLower);
                                        });
                                    }

                                    const count = leafDisorders.length;
                                    return searchTerm && searchTerm.trim()
                                        ? `${count} matching disorder${count !== 1 ? 's' : ''}`
                                        : `${count} leaf disorder${count !== 1 ? 's' : ''}`;
                                })()}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Box>

                        {/* Children List */}
                        {category.childrenData?.items && category.childrenData.items.length > 0 ? (
                            <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider' }}>
                                {/* Filter to only show disorders with no children and match search term */}
                                {(() => {
                                    let leafDisorders = category.childrenData.items.filter(child =>
                                        child.descendantCount === 0 || child.descendantCount === undefined
                                    );

                                    // Apply search filter if searchTerm is provided (local filtering only)
                                    if (searchTerm && searchTerm.trim()) {
                                        const searchLower = searchTerm.toLowerCase();
                                        leafDisorders = leafDisorders.filter(child => {
                                            const ptTerm = child.pt?.term?.toLowerCase() || '';
                                            const fsnTerm = child.fsn?.term?.toLowerCase() || '';
                                            return ptTerm.includes(searchLower) || fsnTerm.includes(searchLower);
                                        });
                                    }

                                    if (leafDisorders.length === 0) {
                                        return (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchTerm && searchTerm.trim()
                                                        ? 'No matching diagnoses found in this category'
                                                        : 'No leaf disorders available in this category'
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
                                                                    {child.pt?.term.replace('(disorder)', '') || child.fsn?.term.replace('(disorder)', '') || 'Unknown diagnosis'}
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
                        {categoriesData.filter(item => !item.isSuccess || !item.childrenSuccess).length} categories are temporarily unavailable due to SNOMED API connectivity issues.
                    </Alert>
                )}
            </Box>
        </Box>
    );
};

export default React.memo(BrowseTab); 