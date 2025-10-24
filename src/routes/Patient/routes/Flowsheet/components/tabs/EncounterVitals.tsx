import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { ControlBar } from '../ControlBar';
import { LeftRail } from '../LeftRail';
import { FlowsheetGrid } from '../FlowsheetGrid';
import { AddRowsModal } from '../AddRowsModal';

interface EncounterVitalsProps {
    flowsheet: any; // Type this properly based on your flowsheet hook return type
}

export const EncounterVitals: React.FC<EncounterVitalsProps> = ({ flowsheet }) => {
    const { visibleRows, setVisibleRows } = flowsheet;

    // Local state
    const [mode, setMode] = useState('View All');
    const [showAddRowsModal, setShowAddRowsModal] = useState(false);

    // Memoized event handlers
    const handleCellEdit = useCallback((rowId: string, columnIndex: number) => {
        console.log('Cell edit:', rowId, columnIndex);
    }, []);

    const handleCellSave = useCallback(() => {
        console.log('Cell save');
    }, []);

    const handleCellCancel = useCallback(() => {
        console.log('Cell cancel');
    }, []);

    const handleAddRows = useCallback((rows: any[]) => {
        console.log('Add rows:', rows);
        setShowAddRowsModal(false);
    }, []);

    return (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Rail */}
            <LeftRail flowsheet={flowsheet} />

            {/* Main Panel */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Control Bar */}
                <ControlBar
                    mode={mode}
                    onModeChange={setMode}
                    flowsheet={flowsheet}
                />

                {/* Flowsheet Grid */}
                <FlowsheetGrid
                    onCellEdit={handleCellEdit}
                    onCellSave={handleCellSave}
                    onCellCancel={handleCellCancel}
                    flowsheet={flowsheet}
                />
            </Box>

            {/* Add Rows Modal */}
            <AddRowsModal
                open={showAddRowsModal}
                onClose={() => setShowAddRowsModal(false)}
                onAddRows={handleAddRows}
            />
        </Box>
    );
};
