import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { getCodesForChapter, getAllCategories } from '../../util/icd10';

const PreferenceListContext = createContext();

export const usePreferenceLists = () => {
    const context = useContext(PreferenceListContext);
    if (!context) {
        throw new Error('usePreferenceLists must be used within a PreferenceListProvider');
    }
    return context;
};

export const PreferenceListProvider = ({ children }) => {
    // Initialize with real ICD-10 data
    const [preferenceListsData, setPreferenceListsData] = useState(() => {
        const categories = getAllCategories();

        // Get some common diagnoses from different chapters
        const frequentDiagnoses = [
            ...getCodesForChapter('endocrine').slice(0, 5),      // Diabetes, thyroid issues
            ...getCodesForChapter('circulatory').slice(0, 5),    // Hypertension, heart disease
            ...getCodesForChapter('respiratory').slice(0, 5),    // Asthma, COPD
            ...getCodesForChapter('digestive').slice(0, 5),      // GERD, IBS
        ];

        const recentDiagnoses = [
            ...getCodesForChapter('infectious').slice(0, 3),     // Common infections
            ...getCodesForChapter('musculoskeletal').slice(0, 3), // Back pain, arthritis
            ...getCodesForChapter('mental').slice(0, 3),         // Depression, anxiety
            ...getCodesForChapter('skin').slice(0, 3),           // Eczema, psoriasis
        ];

        const primaryCareDiagnoses = [
            ...getCodesForChapter('endocrine').slice(0, 4),      // Diabetes, thyroid
            ...getCodesForChapter('circulatory').slice(0, 4),    // Hypertension
            ...getCodesForChapter('respiratory').slice(0, 4),    // Asthma
            ...getCodesForChapter('digestive').slice(0, 4),      // Common GI issues
        ];

        const emergencyDiagnoses = [
            ...getCodesForChapter('circulatory').slice(0, 4),    // Heart attack, stroke
            ...getCodesForChapter('respiratory').slice(0, 4),    // Pneumonia, COPD exacerbation
            ...getCodesForChapter('musculoskeletal').slice(0, 4), // Fractures, trauma
            ...getCodesForChapter('digestive').slice(0, 4),      // Appendicitis, cholecystitis
        ];

        const result = [
            {
                id: 'personal',
                label: 'Personal Lists',
                children: [
                    {
                        id: 'personal-frequent',
                        label: 'My Frequent Diagnoses',
                        type: 'personal',
                        diagnoses: frequentDiagnoses
                    },
                    {
                        id: 'personal-recent',
                        label: 'Recently Used',
                        type: 'personal',
                        diagnoses: recentDiagnoses
                    }
                ]
            },
            {
                id: 'organizational',
                label: 'Organizational Lists',
                children: [
                    {
                        id: 'org-primary-care',
                        label: 'Primary Care Common',
                        type: 'organizational',
                        diagnoses: primaryCareDiagnoses
                    },
                    {
                        id: 'org-emergency',
                        label: 'Emergency Department',
                        type: 'organizational',
                        diagnoses: emergencyDiagnoses
                    }
                ]
            }
        ];

        console.log('Preference lists initialized with ICD-10 data:', result);
        return result;
    });

    // Favorites system - using real ICD-10 concept IDs
    const [favorites, setFavorites] = useState(new Set(['E11.9', 'I10'])); // Type 2 diabetes, Essential hypertension

    // Toggle favorite status
    const toggleFavorite = useCallback((conceptId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(conceptId)) {
                newFavorites.delete(conceptId);
            } else {
                newFavorites.add(conceptId);
            }
            return newFavorites;
        });
        // TODO: Save to backend API
    }, []);

    // Check if diagnosis is favorite
    const isFavorite = useCallback((conceptId) => {
        return favorites.has(conceptId);
    }, [favorites]);

    // Add diagnosis to a preference list
    const addToPreferenceList = useCallback((listId, diagnosis) => {
        setPreferenceListsData(prev => prev.map(section => ({
            ...section,
            children: section.children?.map(list => {
                if (list.id === listId) {
                    const exists = list.diagnoses.some(d => d.conceptId === diagnosis.conceptId);
                    if (!exists) {
                        return {
                            ...list,
                            diagnoses: [...list.diagnoses, diagnosis]
                        };
                    }
                }
                return list;
            }) || section.children
        })));
        // TODO: Sync with backend API
    }, []);

    // Remove diagnosis from a preference list
    const removeFromPreferenceList = useCallback((listId, conceptId) => {
        setPreferenceListsData(prev => prev.map(section => ({
            ...section,
            children: section.children?.map(list =>
                list.id === listId
                    ? { ...list, diagnoses: list.diagnoses.filter(d => d.conceptId !== conceptId) }
                    : list
            ) || section.children
        })));
        // TODO: Sync with backend API
    }, []);

    // Get all preference lists flattened for management interface
    const getAllPreferenceLists = useMemo(() => {
        const allLists = [];
        preferenceListsData.forEach(section => {
            if (section.children) {
                section.children.forEach(list => {
                    allLists.push({
                        ...list,
                        name: list.label, // Normalize to 'name' for consistency
                    });
                });
            }
        });
        return allLists;
    }, [preferenceListsData]);

    const value = useMemo(() => ({
        preferenceListsData,
        setPreferenceListsData,
        favorites,
        toggleFavorite,
        isFavorite,
        addToPreferenceList,
        removeFromPreferenceList,
        getAllPreferenceLists
    }), [
        preferenceListsData,
        favorites,
        toggleFavorite,
        isFavorite,
        addToPreferenceList,
        removeFromPreferenceList,
        getAllPreferenceLists
    ]);

    return (
        <PreferenceListContext.Provider value={value}>
            {children}
        </PreferenceListContext.Provider>
    );
}; 
