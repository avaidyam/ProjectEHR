import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const SelectedDiagnosesContext = createContext();

export const useSelectedDiagnoses = () => {
    const context = useContext(SelectedDiagnosesContext);
    if (!context) {
        throw new Error('useSelectedDiagnoses must be used within a SelectedDiagnosesProvider');
    }
    return context;
};

export const SelectedDiagnosesProvider = ({ children }) => {
    const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);

    const addDiagnosis = useCallback((diagnosis) => {
        // Prevent duplicates by checking conceptId
        setSelectedDiagnoses(prev => {
            const exists = prev.some(item => item.conceptId === diagnosis.conceptId);
            if (exists) {
                return prev; // Don't add if already exists
            }
            return [...prev, {
                ...diagnosis,
                addedAt: new Date().toISOString(), // Track when it was added
                source: diagnosis.source || 'unknown' // Track if it came from BROWSE or DATABASE
            }];
        });
    }, []);

    const removeDiagnosis = useCallback((conceptId) => {
        setSelectedDiagnoses(prev => prev.filter(item => item.conceptId !== conceptId));
    }, []);

    const clearAllDiagnoses = useCallback(() => {
        setSelectedDiagnoses([]);
    }, []);

    const isDiagnosisSelected = useCallback((conceptId) => {
        return selectedDiagnoses.some(item => item.conceptId === conceptId);
    }, [selectedDiagnoses]);

    const value = useMemo(() => ({
        selectedDiagnoses,
        addDiagnosis,
        removeDiagnosis,
        clearAllDiagnoses,
        isDiagnosisSelected,
        count: selectedDiagnoses.length
    }), [selectedDiagnoses, addDiagnosis, removeDiagnosis, clearAllDiagnoses, isDiagnosisSelected]);

    return (
        <SelectedDiagnosesContext.Provider value={value}>
            {children}
        </SelectedDiagnosesContext.Provider>
    );
}; 