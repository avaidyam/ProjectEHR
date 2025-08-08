import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const PreferenceListContext = createContext();

export const usePreferenceLists = () => {
    const context = useContext(PreferenceListContext);
    if (!context) {
        throw new Error('usePreferenceLists must be used within a PreferenceListProvider');
    }
    return context;
};

export const PreferenceListProvider = ({ children }) => {
    // TODO: Load from backend API
    const [preferenceListsData, setPreferenceListsData] = useState([
        {
            id: 'personal',
            label: 'Personal Lists',
            children: [
                {
                    id: 'personal-frequent',
                    label: 'My Frequent Diagnoses',
                    type: 'personal',
                    diagnoses: [
                        { conceptId: '38341003', name: 'Hypertensive disorder', term: 'Essential hypertension' },
                        { conceptId: '73211009', name: 'Diabetes mellitus', term: 'Type 2 diabetes mellitus' },
                        { conceptId: '195967001', name: 'Asthma', term: 'Bronchial asthma' },
                        { conceptId: '444814009', name: 'Viral upper respiratory tract infection', term: 'Common cold' }
                    ]
                },
                {
                    id: 'personal-recent',
                    label: 'Recently Used',
                    type: 'personal',
                    diagnoses: [
                        { conceptId: '233604007', name: 'Pneumonia', term: 'Community acquired pneumonia' },
                        { conceptId: '271737000', name: 'Anemia', term: 'Iron deficiency anemia' },
                        { conceptId: '22298006', name: 'Myocardial infarction', term: 'Acute myocardial infarction' }
                    ]
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
                    diagnoses: [
                        { conceptId: '38341003', name: 'Hypertensive disorder', term: 'Essential hypertension' },
                        { conceptId: '73211009', name: 'Diabetes mellitus', term: 'Type 2 diabetes mellitus' },
                        { conceptId: '195967001', name: 'Asthma', term: 'Bronchial asthma' },
                        { conceptId: '68496003', name: 'Polyp of colon', term: 'Colonic polyp' },
                        { conceptId: '15777000', name: 'Prediabetes', term: 'Impaired glucose tolerance' }
                    ]
                },
                {
                    id: 'org-emergency',
                    label: 'Emergency Department',
                    type: 'organizational',
                    diagnoses: [
                        { conceptId: '233604007', name: 'Pneumonia', term: 'Community acquired pneumonia' },
                        { conceptId: '22298006', name: 'Myocardial infarction', term: 'Acute myocardial infarction' },
                        { conceptId: '125605004', name: 'Fracture of bone', term: 'Closed fracture' },
                        { conceptId: '74400008', name: 'Appendicitis', term: 'Acute appendicitis' }
                    ]
                }
            ]
        }
    ]);

    // Favorites system
    const [favorites, setFavorites] = useState(new Set(['38341003', '73211009'])); // TODO: Load from user preferences

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