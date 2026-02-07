import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { usePatient, useDatabase } from '../../../../components/contexts/PatientContext';
import { FlowsheetGrid } from './components/FlowsheetGrid';
import LeftRail from './components/LeftRail';
import { v4 as uuidv4 } from 'uuid';
import DateHelpers from 'util/helpers.js';

export interface FlowsheetEntry {
    id: string;
    columnId: string; // Changed from timestamp to columnId
    rowId: string; // e.g., "BP", "Pulse"
    value: string | number;
    unit?: string;
    status: "draft" | "final" | "saved";
}

export interface FlowsheetRow {
    id?: string; // Legacy support
    name: string;
    label: string;
    type: string;
    options?: string[];
    unit?: string;
    group?: string; // Legacy support
    category?: string; // New field for sidebar grouping/headers
    order?: number; // Legacy support
}

export interface FlowsheetGroup {
    id: string;
    name: string;
    rows: FlowsheetRow[];
}

export interface TimeColumn {
    id: string; // Unique ID for the column
    timestamp: string; // ISO 8601 - for display purposes
    displayTime: string; // Military time format
    isCurrentTime: boolean;
    index: number;
}

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
    const tabs = useMemo(() => (flowsheetDefs || []).map((group: any) => {
        if (group.rows && Array.isArray(group.rows)) {
            return {
                id: group.id || group.name, // Use ID if available, fall back to name
                label: group.name,
                rows: group.rows
            };
        }
        return null;
    }).filter((t: any) => t !== null), [flowsheetDefs]);

    const activeGroup = useMemo(() => tabs.find((t: any) => t.id === activeTab) || tabs[0], [tabs, activeTab]);

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
            activeGroup.rows.forEach((row: any) => {
                const key = row.name;
                if (d[key] !== undefined && d[key] !== null) {
                    flattenedEntries.push({
                        id: `${d.id}::${key}`, // synthetic ID
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

    // 3. Last Filed Values
    const lastFiledValues = useMemo(() => {
        if (!activeGroup || !flowsheetData) return {};

        const groupData = (flowsheetData || [])
            .filter((d: any) => d.flowsheet === activeGroup.id)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const lastValues: { [key: string]: string | number } = {};

        // Iterate sorted data (oldest to newest) to find last non-null value
        groupData.forEach((d: any) => {
            activeGroup.rows.forEach((row: any) => {
                const key = row.name;
                if (d[key] !== undefined && d[key] !== null && d[key] !== '') {
                    lastValues[key] = d[key];
                }
            });
        });

        return lastValues;
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

    // --- Visibility State ---
    const [visibleRows, setVisibleRows] = useState<string[]>([]);

    // Reset visible rows when active group changes
    useEffect(() => {
        if (activeGroup?.rows) {
            setVisibleRows(activeGroup.rows.map((r: any) => r.name));
        }
    }, [activeGroup]);

    const handleToggleRow = useCallback((rowName: string) => {
        setVisibleRows(prev => {
            if (prev.includes(rowName)) {
                return prev.filter(r => r !== rowName);
            }
            return [...prev, rowName];
        });
    }, []);

    const handleToggleCategory = useCallback((category: string, allSelected: boolean) => {
        if (!activeGroup?.rows) return;

        const categoryRows = activeGroup.rows.filter((r: any) =>
            (r.category || r.group || 'Uncategorized') === category
        ).map((r: any) => r.name);

        setVisibleRows(prev => {
            if (allSelected) {
                // Deselect all in category
                return prev.filter(r => !categoryRows.includes(r));
            } else {
                // Select all in category
                const newRows = [...prev];
                categoryRows.forEach((r: string) => {
                    if (!newRows.includes(r)) newRows.push(r);
                });
                return newRows;
            }
        });
    }, [activeGroup]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'none' }}>
                    Flowsheets
                </Typography>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value) => handleTabChange(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((t: any) => ({ id: t.id, label: t.label })).map((tab: any) => (
                        <Tab key={tab.id} value={tab.id} label={tab.label} />
                    ))}
                </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
                {/* Sidebar */}
                {activeGroup && (
                    <LeftRail
                        rows={activeGroup.rows}
                        visibleRows={visibleRows}
                        onToggleRow={handleToggleRow}
                        onToggleCategory={handleToggleCategory}
                    />
                )}

                {/* Main Grid Area */}
                <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
                    {activeGroup ? (
                        <FlowsheetGrid
                            rowsDefinition={activeGroup.rows}
                            entries={entries}
                            timeColumns={timeColumns}
                            visibleRows={visibleRows} // Pass visibility state
                            lastFiledValues={lastFiledValues}
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
        </Box>
    );
};