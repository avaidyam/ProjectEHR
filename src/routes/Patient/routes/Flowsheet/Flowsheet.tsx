import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { usePatient, useDatabase } from '../../../../components/contexts/PatientContext';
import { TopAppBar } from './components/TopAppBar';
import { SecondaryBar } from './components/SecondaryBar';
import { FlowsheetGrid } from './components/FlowsheetGrid';
import { FlowsheetEntry, TimeColumn } from './types/flowsheet.types';
import { v4 as uuidv4 } from 'uuid';
import DateHelpers from 'util/helpers.js';

const generateId = () => uuidv4();

const createNowColumn = (): TimeColumn => ({
    id: generateId(),
    timestamp: new Date().toISOString(),
    displayTime: 'Now',
    isCurrentTime: true,
    index: 0,
});

export const Flowsheet = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [flowsheetDefs] = useDatabase().flowsheets();

    // Default active tab
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'vitals');

    // Context Data
    const { useEncounter } = usePatient();
    const [flowsheetData, setFlowsheetData] = useEncounter().flowsheets();

    // Local state for the "Now" column which is not yet saved to DB
    const [nowColumn, setNowColumn] = useState<TimeColumn>(createNowColumn());

    // Update active tab if search params change
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        setSearchParams({ tab: newTab }, { replace: true });
    };

    // Prepare tab list from definitions
    const tabs = (flowsheetDefs || []).map((group: any) => {
        if (group.rows && Array.isArray(group.rows)) {
            return {
                id: group.id || group.name, // Use ID if available, fall back to name
                label: group.name,
                rows: group.rows
            };
        }
        return null;
    }).filter((t: any) => t !== null);

    const activeGroup = tabs.find((t: any) => t.id === activeTab) || tabs[0];

    // --- Derived State ---

    // 1. Time Columns: Persisted (from flowsheetData) + Now Column
    const timeColumns = useMemo(() => {
        if (!activeGroup) return [nowColumn];

        // Filter data for this flowsheet group
        const groupData = (flowsheetData || []).filter((d: any) => d.flowsheet === activeGroup.id);

        const sortedData = groupData.sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const persistedColumns: TimeColumn[] = sortedData.map((d: any) => ({
            id: d.id,
            timestamp: d.date,
            displayTime: DateHelpers.convertToDateTime(d.date).toFormat('HHmm'), // Format nicely
            isCurrentTime: false,
        }));

        return [...persistedColumns, nowColumn];
    }, [flowsheetData, activeGroup, nowColumn]);

    // 2. Entries: Flattened list from flowsheetData
    const entries = useMemo(() => {
        if (!activeGroup) return [];

        if (!flowsheetData) return [];

        const groupData = flowsheetData.filter((d: any) => d.flowsheet === activeGroup.id);
        const flattenedEntries: FlowsheetEntry[] = [];

        groupData.forEach((d: any) => {
            // d is { id, date, flowsheet, bp: 120, ... }
            // activeGroup.rows has names like 'bloodPressureSystolic'
            activeGroup.rows.forEach((row: any) => {
                const key = row.name;
                if (d[key] !== undefined && d[key] !== null) {
                    flattenedEntries.push({
                        id: `${d.id}-${key}`, // synthetic ID
                        rowId: key,
                        columnId: d.id,
                        value: d[key],
                        status: 'saved'
                    });
                }
            });
        });

        return flattenedEntries;
    }, [flowsheetData, activeGroup]);

    // --- Handlers ---

    // Update the "Now" column's timestamp (called by timer) OR convert to persisted
    const handleUpdateTimeColumn = useCallback((id: string, updates: Partial<TimeColumn>) => {
        if (id === nowColumn.id) {
            if (updates.isCurrentTime === false) {
                // Formatting "Now" to a saved column
                // Create the object in flowsheetData
                // We use the timestamp from the update or the current nowColumn
                const newTimestamp = updates.timestamp || nowColumn.timestamp;

                const newEntryObject = {
                    id: nowColumn.id, // Keep the same ID so entries mapped to it still work
                    date: newTimestamp,
                    flowsheet: activeGroup?.id,
                    // other fields empty initially
                };

                setFlowsheetData((prev: any[]) => {
                    // Check if exists (shouldn't)
                    const exists = prev.find(d => d.id === nowColumn.id);
                    if (exists) return prev;
                    return [...(prev || []), newEntryObject];
                });

                // note: we don't update nowColumn state here because we expect `handleAddTimeColumn` to spawn a NEW one immediately after
            } else {
                // Just updating timestamp locally
                setNowColumn(prev => ({ ...prev, ...updates }));
            }
        } else {
            // Updating a persisted column (e.g. editing time manually)
            // Not yet implemented in UI but good to have logic
            setFlowsheetData((prev: any[]) => prev.map(d =>
                d.id === id ? { ...d, date: updates.timestamp || d.date } : d
            ));
        }
    }, [nowColumn, activeGroup, setFlowsheetData]);

    const handleAddTimeColumn = useCallback((column: TimeColumn) => {
        // This is called by Grid to spawn the NEW "Now" column
        setNowColumn(column);
    }, []);

    const handleAddEntry = useCallback((entry: Omit<FlowsheetEntry, 'id'>) => {
        // entry: { rowId, columnId, value }
        setFlowsheetData((prev: any[]) => {
            // Find the time column object
            const exists = prev.find(d => d.id === entry.columnId);
            if (exists) {
                return prev.map(d => d.id === entry.columnId ? { ...d, [entry.rowId]: entry.value } : d);
            }

            const newObj = {
                id: entry.columnId,
                date: new Date().toISOString(), // Fallback
                flowsheet: activeGroup?.id,
                [entry.rowId]: entry.value
            };
            return [...(prev || []), newObj];
        });
    }, [activeGroup, setFlowsheetData]);

    const handleUpdateEntry = useCallback((id: string, updates: Partial<FlowsheetEntry>) => {
        const [columnId, rowId] = id.split('::');

        if (columnId && rowId && updates.value !== undefined) {
            setFlowsheetData((prev: any[]) => prev.map(d =>
                d.id === columnId ? { ...d, [rowId]: updates.value } : d
            ));
        }
    }, [setFlowsheetData]);

    // Re-memoize entries with better ID
    const entriesWithBetterIds = useMemo(() => {
        if (!activeGroup || !flowsheetData) return [];
        const groupData = flowsheetData.filter((d: any) => d.flowsheet === activeGroup.id);
        const flattenedEntries: FlowsheetEntry[] = [];

        groupData.forEach((d: any) => {
            activeGroup.rows.forEach((row: any) => {
                const key = row.name;
                if (d[key] !== undefined && d[key] !== null) {
                    flattenedEntries.push({
                        id: `${d.id}::${key}`, // Better separator
                        rowId: key,
                        columnId: d.id,
                        value: d[key],
                        status: 'saved'
                    });
                }
            });
        });
        return flattenedEntries;
    }, [flowsheetData, activeGroup]);


    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopAppBar />
            <SecondaryBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                searchValue=""
                onSearchChange={() => { }}
                tabs={tabs.map((t: any) => ({ id: t.id, label: t.label }))}
            />
            <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}>
                {activeGroup ? (
                    <FlowsheetGrid
                        rowsDefinition={activeGroup.rows}
                        entries={entriesWithBetterIds} // Use the one with "::" IDs
                        timeColumns={timeColumns}
                        onAddEntry={handleAddEntry}
                        onUpdateEntry={handleUpdateEntry}
                        onAddTimeColumn={handleAddTimeColumn}
                        onUpdateTimeColumn={handleUpdateTimeColumn}
                    />
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">No flowsheet definitions found.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};