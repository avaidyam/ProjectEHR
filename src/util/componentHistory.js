/**
 * Generates a mapping of component names to their values across both
 * the current encounter and the entire chart.
 * 
 * @param {Array} encounterLabs - Labs from the current encounter
 * @param {Array} chartLabs - All labs from the patient's chart
 * @returns {Object} - Map of component name to { encounter: [], chart: [] }
 */
export function getComponentHistory(encounterLabs, chartLabs) {
    const componentMap = {};

    // Helper to add a component value to the map
    const addComponent = (componentName, value, date, source) => {
        if (!componentMap[componentName]) {
            componentMap[componentName] = { encounter: [], chart: [] };
        }
        componentMap[componentName][source].push({
            value,
            date,
            timestamp: new Date(date).getTime(),
        });
    };

    // Process encounter labs
    (encounterLabs || []).forEach(lab => {
        const labDate = lab.date;
        (lab.components || []).forEach(component => {
            addComponent(component.name, component.value, labDate, 'encounter');
        });
    });

    // Process all chart labs
    (chartLabs || []).forEach(lab => {
        const labDate = lab.date;
        (lab.components || []).forEach(component => {
            addComponent(component.name, component.value, labDate, 'chart');
        });
    });

    // Sort each component's values by date descending (newest first)
    Object.keys(componentMap).forEach(componentName => {
        componentMap[componentName].encounter.sort((a, b) => b.timestamp - a.timestamp);
        componentMap[componentName].chart.sort((a, b) => b.timestamp - a.timestamp);
    });

    return componentMap;
}

/**
 * Formats a date for display in the component popover (MM/DD/YY HHmm format)
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatComponentDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${month}/${day}/${year} ${hours}${minutes}`;
}

/**
 * Generates a mapping of flowsheet row names to their values across both
 * the current encounter and the entire chart.
 * 
 * @param {Array} encounterFlowsheets - Flowsheets from the current encounter
 * @param {Array} chartFlowsheets - All flowsheets from the patient's chart
 * @param {Array} flowsheetDefs - Flowsheet definitions for row label lookup
 * @returns {Object} - Map of row name to { encounter: [], chart: [] }
 */
export function getFlowsheetHistory(encounterFlowsheets, chartFlowsheets, flowsheetDefs) {
    const flowsheetMap = {};

    // Helper to get row label from definitions
    const getRowLabel = (flowsheetId, rowName) => {
        const groupDef = (flowsheetDefs || []).find(g => g.id === flowsheetId);
        if (groupDef && groupDef.rows) {
            const rowDef = groupDef.rows.find(r => r.name === rowName);
            if (rowDef) return rowDef.label;
        }
        return rowName;
    };

    // Helper to add a flowsheet value to the map
    const addFlowsheetValue = (rowLabel, value, date, source) => {
        if (!flowsheetMap[rowLabel]) {
            flowsheetMap[rowLabel] = { encounter: [], chart: [] };
        }
        flowsheetMap[rowLabel][source].push({
            value,
            date,
            timestamp: new Date(date).getTime(),
        });
    };

    // Process encounter flowsheets
    (encounterFlowsheets || []).forEach(item => {
        const itemDate = item.date;
        Object.keys(item).forEach(key => {
            if (['id', 'date', 'flowsheet'].includes(key)) return;
            const rowLabel = getRowLabel(item.flowsheet, key);
            addFlowsheetValue(rowLabel, item[key], itemDate, 'encounter');
        });
    });

    // Process all chart flowsheets
    (chartFlowsheets || []).forEach(item => {
        const itemDate = item.date;
        Object.keys(item).forEach(key => {
            if (['id', 'date', 'flowsheet'].includes(key)) return;
            const rowLabel = getRowLabel(item.flowsheet, key);
            addFlowsheetValue(rowLabel, item[key], itemDate, 'chart');
        });
    });

    // Sort each row's values by date descending (newest first)
    Object.keys(flowsheetMap).forEach(rowName => {
        flowsheetMap[rowName].encounter.sort((a, b) => b.timestamp - a.timestamp);
        flowsheetMap[rowName].chart.sort((a, b) => b.timestamp - a.timestamp);
    });

    return flowsheetMap;
}
