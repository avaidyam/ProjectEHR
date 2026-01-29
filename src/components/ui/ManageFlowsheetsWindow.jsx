import React, { useState } from 'react';
import { MenuItem, Select, InputLabel, FormControl, Menu } from '@mui/material';
import { Box, Button, Window, TextField, TreeView, TreeItem, Icon, IconButton, Divider } from 'components/ui/Core.jsx';
import { useDatabase } from 'components/contexts/PatientContext';

export const ManageFlowsheetsWindow = ({ open, onClose }) => {
    const [flowsheets, setFlowsheets] = useDatabase().flowsheets();

    // Structure: [ { id, name, rows: [ { name, type, label, options } ] } ]

    const [contextMenu, setContextMenu] = useState(null);

    // Dialog/Form states
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [isAddingRow, setIsAddingRow] = useState(false);
    const [isEditingRow, setIsEditingRow] = useState(false);

    // Form Data for Group
    const [groupData, setGroupData] = useState({ id: "", name: "" });

    // Form Data for Row
    const [rowData, setRowData] = useState({
        name: "", // check unique within group? or globally? assuming globally or within group.
        label: "",
        type: "number",
        targetGroupId: ""
    });

    const handleContextMenu = (event, type, id, parentId) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                    type,
                    id,
                    parentId
                }
                : null,
        );
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    // --- GROUP ACTIONS ---

    const handleAddGroup = () => {
        if (!groupData.name) return;
        const newGroup = {
            id: Math.floor(Math.random() * 100000000).toString(),
            name: groupData.name,
            rows: []
        };
        setFlowsheets(prev => [...prev, newGroup]);
        setGroupData({ id: "", name: "" });
        setIsAddingGroup(false);
    };

    const handleEditGroup = () => {
        if (!groupData.name || !groupData.id) return;
        setFlowsheets(prev => prev.map(g => g.id === groupData.id ? { ...g, name: groupData.name } : g));
        setGroupData({ id: "", name: "" });
        setIsEditingGroup(false);
    };

    const handleDeleteGroup = (groupId) => {
        if (window.confirm("Are you sure you want to delete this group and all its rows?")) {
            setFlowsheets(prev => prev.filter(g => g.id !== groupId));
        }
        handleCloseContextMenu();
    };

    const startAddGroup = () => {
        setGroupData({ id: "", name: "" });
        setIsAddingGroup(true);
        handleCloseContextMenu();
    }

    const startEditGroup = (groupId) => {
        const group = flowsheets.find(g => g.id === groupId);
        if (group) {
            setGroupData({ ...group });
            setIsEditingGroup(true);
        }
        handleCloseContextMenu();
    };

    // --- ROW ACTIONS ---

    const handleAddRow = () => {
        if (!rowData.name || !rowData.label || !rowData.targetGroupId) return;

        setFlowsheets(prev => prev.map(g => {
            if (g.id === rowData.targetGroupId) {
                // Check name uniqueness in group
                if (g.rows.some(r => r.name === rowData.name)) {
                    window.alert("Row Name must be unique within the group.");
                    return g; // TODO: prevent proper return?
                }
                return {
                    ...g,
                    rows: [...g.rows, {
                        name: rowData.name,
                        label: rowData.label,
                        type: rowData.type,
                        options: []
                    }]
                };
            }
            return g;
        }));

        setRowData({ name: "", label: "", type: "number", targetGroupId: "" });
        setIsAddingRow(false);
    };

    const handleEditRow = () => {
        if (!rowData.name || !rowData.label || !rowData.targetGroupId) return; // targetGroupId here acts as the parent group ID we are editing in

        setFlowsheets(prev => prev.map(g => {
            if (g.id === rowData.targetGroupId) {
                return {
                    ...g,
                    rows: g.rows.map(r => r.name === rowData.name ? { ...r, label: rowData.label, type: rowData.type } : r)
                };
            }
            return g;
        }));

        setRowData({ name: "", label: "", type: "number", targetGroupId: "" });
        setIsEditingRow(false);
    };

    const handleDeleteRow = (rowName, groupId) => {
        if (window.confirm("Are you sure you want to delete this row?")) {
            setFlowsheets(prev => prev.map(g => {
                if (g.id === groupId) {
                    return { ...g, rows: g.rows.filter(r => r.name !== rowName) };
                }
                return g;
            }));
        }
        handleCloseContextMenu();
    };

    const startAddRow = (groupId) => {
        setRowData({ name: "", label: "", type: "number", targetGroupId: groupId });
        setIsAddingRow(true);
        handleCloseContextMenu();
    };

    const startEditRow = (rowName, groupId) => {
        const group = flowsheets.find(g => g.id === groupId);
        const row = group?.rows.find(r => r.name === rowName);
        if (row) {
            setRowData({
                name: row.name,
                label: row.label,
                type: row.type || "number",
                targetGroupId: groupId
            });
            setIsEditingRow(true);
        }
        handleCloseContextMenu();
    };


    const renderForm = () => {
        if (isAddingGroup || isEditingGroup) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Group Name"
                        value={groupData.name}
                        onChange={e => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => { setIsAddingGroup(false); setIsEditingGroup(false); }}>Cancel</Button>
                        <Button variant="contained" onClick={isAddingGroup ? handleAddGroup : handleEditGroup}>
                            {isAddingGroup ? "Add Group" : "Save Group"}
                        </Button>
                    </Box>
                </Box>
            );
        }

        if (isAddingRow || isEditingRow) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Name (ID)"
                        value={rowData.name}
                        onChange={e => setRowData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isEditingRow} // Name key cannot change
                        required
                    />
                    <TextField
                        label="Label (Display Name)"
                        value={rowData.label}
                        onChange={e => setRowData(prev => ({ ...prev, label: e.target.value }))}
                        required
                        autoFocus={isEditingRow}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={rowData.type}
                            label="Type"
                            onChange={e => setRowData(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <MenuItem value="number">Number</MenuItem>
                            <MenuItem value="string">String</MenuItem>
                            <MenuItem value="select">Select</MenuItem>
                            {/* Add other types if found in usage */}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => { setIsAddingRow(false); setIsEditingRow(false); }}>Cancel</Button>
                        <Button variant="contained" onClick={isAddingRow ? handleAddRow : handleEditRow}>
                            {isAddingRow ? "Add Row" : "Save Row"}
                        </Button>
                    </Box>
                </Box>
            );
        }

        return (
            <TreeView
                aria-label="flowsheet definitions"
                defaultCollapseIcon={<Icon>expand_more</Icon>}
                defaultExpandIcon={<Icon>chevron_right</Icon>}
                sx={{ overflowY: 'auto', flexGrow: 1 }}
            >
                {flowsheets && flowsheets.map((group) => (
                    <TreeItem
                        key={`group-${group.id}`}
                        itemId={`group-${group.id}`}
                        label={
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
                                onContextMenu={(e) => handleContextMenu(e, 'group', group.id)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Icon sx={{ mr: 1, fontSize: 20 }}>folder</Icon>
                                    <span style={{ fontWeight: 500 }}>{group.name}</span>
                                </Box>
                                <IconButton size="small" onClick={(e) => {
                                    e.stopPropagation();
                                    handleContextMenu(e, 'group', group.id);
                                }}>
                                    <Icon sx={{ fontSize: 16 }}>more_vert</Icon>
                                </IconButton>
                            </Box>
                        }
                    >
                        {group.rows.map(row => (
                            <TreeItem
                                key={`row-${row.name}`}
                                itemId={`row-${row.name}`}
                                label={
                                    <Box
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
                                        onContextMenu={(e) => handleContextMenu(e, 'row', row.name, group.id)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Icon sx={{ mr: 1, fontSize: 20 }}>description</Icon>
                                            {row.label}
                                            <span style={{ opacity: 0.6, fontSize: '0.85em', marginLeft: 8 }}>({row.type})</span>
                                        </Box>
                                        <IconButton size="small" onClick={(e) => {
                                            e.stopPropagation();
                                            handleContextMenu(e, 'row', row.name, group.id);
                                        }}>
                                            <Icon sx={{ fontSize: 16 }}>more_vert</Icon>
                                        </IconButton>
                                    </Box>
                                }
                            />
                        ))}
                    </TreeItem>
                ))}
            </TreeView>
        );
    };

    return (
        <Window
            open={open}
            onClose={onClose}
            title="Flowsheet Definitions"
            fullWidth
            maxWidth="md"
        >
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                {!isAddingGroup && !isEditingGroup && !isAddingRow && !isEditingRow && (
                    <Button variant="contained" startIcon={<Icon>create_new_folder</Icon>} onClick={startAddGroup}>
                        Add Group
                    </Button>
                )}
            </Box>

            {renderForm()}

            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                {contextMenu?.type === 'group' && (
                    <>
                        <MenuItem onClick={() => startAddRow(contextMenu.id)}>Add Row</MenuItem>
                        <MenuItem onClick={() => startEditGroup(contextMenu.id)}>Rename Group</MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleDeleteGroup(contextMenu.id)} sx={{ color: 'error.main' }}>Delete Group</MenuItem>
                    </>
                )}
                {contextMenu?.type === 'row' && (
                    <>
                        <MenuItem onClick={() => startEditRow(contextMenu.id, contextMenu.parentId)}>Edit Row</MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleDeleteRow(contextMenu.id, contextMenu.parentId)} sx={{ color: 'error.main' }}>Delete Row</MenuItem>
                    </>
                )}
            </Menu>
        </Window>
    );
};
