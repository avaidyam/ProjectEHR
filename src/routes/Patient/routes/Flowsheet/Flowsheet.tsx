import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { usePatient } from '../../../../components/contexts/PatientContext';
import { useFlowsheet } from './hooks/useFlowsheet';
import { TopAppBar } from './components/TopAppBar';
import { SecondaryBar } from './components/SecondaryBar';
import { EncounterVitals, VsPtReported, TravelHistory, Labs } from './components/tabs';

export const Flowsheet = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'encounter-vitals';

    // Get encounter context with error handling
    let encounter = null;
    let encounterId = 'default';

    try {
        const { useEncounter } = usePatient();
        const [encounterData] = useEncounter();
        encounter = encounterData;

        if (encounter && encounter.id !== undefined && encounter.id !== null) {
            encounterId = String(encounter.id);
        }
    } catch (error) {
        console.warn('Error accessing encounter data:', error);
        encounterId = 'default';
    }

    // Get flowsheet state and actions - shared across all tabs
    const flowsheet = useFlowsheet(encounterId);

    const handleTabChange = (newTab: string) => {
        setSearchParams({ tab: newTab }, { replace: true });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'encounter-vitals':
                return <EncounterVitals flowsheet={flowsheet} />;
            case 'vs-pt-reported':
                return <VsPtReported flowsheet={flowsheet} />;
            case 'travel-history':
                return <TravelHistory flowsheet={flowsheet} />;
            case 'labs':
                return <Labs flowsheet={flowsheet} />;
            default:
                return <EncounterVitals flowsheet={flowsheet} />;
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top App Bar */}
            <TopAppBar />

            {/* Secondary Bar */}
            <SecondaryBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                searchValue=""
                onSearchChange={() => { }}
            />

            {/* Tab Content */}
            {renderTabContent()}
        </Box>
    );
};