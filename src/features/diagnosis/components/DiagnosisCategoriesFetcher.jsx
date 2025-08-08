import React, { useMemo } from 'react';
import { useSnowmedConcept, useSnowmedChildren } from '../../../services/snowmed';
import DiagnosisMainContent from './DiagnosisMainContent';

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

const DiagnosisCategoriesFetcher = ({ searchTerm = '' }) => {
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
    const { categoriesData, isLoading, summary } = useMemo(() => {
        const allCategoriesLoaded = categoryQueries.every(query => !query.isLoading);
        const allChildrenLoaded = childrenQueries.every(query => !query.isLoading);

        if (!allCategoriesLoaded || !allChildrenLoaded) {
            return {
                categoriesData: [],
                isLoading: true,
                summary: null
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

        // Calculate summary
        const successfulCategories = processedData.filter(item => item.isSuccess);
        const failedCategories = processedData.filter(item => !item.isSuccess);

        const summary = {
            total: processedData.length,
            successful: successfulCategories.length,
            failed: failedCategories.length,
            categories: successfulCategories.map(item => ({
                name: item.categoryName,
                childrenCount: item.childrenData?.length || 0
            }))
        };

        // Log summary only once when data is complete
        if (processedData.length > 0 && !summary.logged) {
            console.log('📊 Diagnosis Categories Summary:');
            console.log('=====================================');
            console.log(`✅ Successful categories: ${summary.successful}`);
            console.log(`❌ Failed categories: ${summary.failed}`);

            summary.categories.forEach(item => {
                console.log(`✅ ${item.name}: ${item.childrenCount} children loaded`);
            });

            failedCategories.forEach(item => {
                console.log(`❌ ${item.categoryName}: Failed to load`);
            });

            // Debug: Log detailed information about each category
            console.log('🔍 Detailed Category Analysis:');
            processedData.forEach((item, index) => {
                console.log(`\n--- Category ${index + 1}: ${item.categoryName} ---`);
                console.log(`Concept ID: ${item.conceptId}`);
                console.log(`Concept Success: ${item.isSuccess}`);
                console.log(`Children Success: ${item.childrenSuccess}`);
                if (item.error) {
                    console.log(`Concept Error:`, item.error);
                }
                if (item.childrenError) {
                    console.log(`Children Error:`, item.childrenError);
                }
                if (item.conceptData) {
                    console.log(`Concept Data:`, item.conceptData);
                }
                if (item.childrenData) {
                    console.log(`Children Data:`, item.childrenData);
                }
            });

            console.log('📋 Complete processed data:', processedData);
            summary.logged = true;
        }

        return {
            categoriesData: processedData,
            isLoading: false,
            summary
        };
    }, [categoryQueries, childrenQueries]);

    return (
        <DiagnosisMainContent
            categoriesData={categoriesData}
            isLoading={isLoading}
            searchTerm={searchTerm}
        />
    );
};

export default React.memo(DiagnosisCategoriesFetcher); 