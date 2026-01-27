import React, { useState } from 'react';
import { MenuItem, Select, InputLabel, FormControl, Menu } from '@mui/material';
import { Box, Button, Window, TextField, TreeView, TreeItem, Icon, IconButton } from 'components/ui/Core.jsx';
import { useDatabase } from 'components/contexts/PatientContext';

export const ManageDepartmentsWindow = ({ open, onClose }) => {
    const [departments, setDepartments] = useDatabase().departments();
    const [providers, setProviders] = useDatabase().providers();

    const [selectedNode, setSelectedNode] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);

    // Dialog/Form states
    const [isAddingDept, setIsAddingDept] = useState(false);
    const [isAddingProvider, setIsAddingProvider] = useState(false);
    const [isMovingProvider, setIsMovingProvider] = useState(false);
    const [isEditingDept, setIsEditingDept] = useState(false);
    const [isEditingProvider, setIsEditingProvider] = useState(false);

    // Form Data
    const [deptName, setDeptName] = useState("");
    const [editingDeptId, setEditingDeptId] = useState(null);

    const [providerData, setProviderData] = useState({
        name: "",
        specialty: "",
        department: "" // dept ID
    });
    const [editingProviderId, setEditingProviderId] = useState(null);

    const [moveProviderData, setMoveProviderData] = useState({
        providerId: null,
        targetDeptId: ""
    });

    const [draggedProviderId, setDraggedProviderId] = useState(null);

    const handleDragStart = (e, providerId) => {
        setDraggedProviderId(providerId);
        e.dataTransfer.setData("text/plain", providerId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, targetDeptId) => {
        e.preventDefault();
        const providerId = draggedProviderId;
        if (!providerId || !targetDeptId) return;

        setProviders(prev => prev.map(p =>
            p.id === providerId
                ? { ...p, department: targetDeptId }
                : p
        ));
        setDraggedProviderId(null);
    };

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

    const handleAddDepartment = () => {
        if (!deptName) return;

        const newId = Math.max(...departments.map(d => d.id), 0) + 1;
        const newDept = {
            id: newId,
            name: deptName,
            identityId: Math.floor(Math.random() * 100000000), // Filler
            specialty: "General", // Default
            location: "Main Building", // Default
            serviceArea: "Hospital" // Default
        };

        setDepartments(prev => [...prev, newDept]);
        setDeptName("");
        setIsAddingDept(false);
    };

    const handleEditDepartment = () => {
        if (!deptName || !editingDeptId) return;

        setDepartments(prev => prev.map(d =>
            d.id === editingDeptId ? { ...d, name: deptName } : d
        ));

        setDeptName("");
        setEditingDeptId(null);
        setIsEditingDept(false);
    };

    const handleAddProvider = () => {
        if (!providerData.name || !providerData.department) return;

        const newId = (Math.max(...providers.map(p => parseInt(p.id) || 0), 0) + 1).toString();
        const newProvider = {
            id: newId,
            name: providerData.name,
            specialty: providerData.specialty,
            department: providerData.department
        };

        setProviders(prev => [...prev, newProvider]);
        setProviderData({ name: "", specialty: "", department: "" });
        setIsAddingProvider(false);
    };

    const handleEditProvider = () => {
        if (!providerData.name || !providerData.department || !editingProviderId) return;

        setProviders(prev => prev.map(p =>
            p.id === editingProviderId
                ? { ...p, name: providerData.name, specialty: providerData.specialty, department: providerData.department }
                : p
        ));

        setProviderData({ name: "", specialty: "", department: "" });
        setEditingProviderId(null);
        setIsEditingProvider(false);
    };

    const handleMoveProvider = () => {
        if (!moveProviderData.providerId || !moveProviderData.targetDeptId) return;

        setProviders(prev => prev.map(p =>
            p.id === moveProviderData.providerId
                ? { ...p, department: moveProviderData.targetDeptId }
                : p
        ));

        setIsMovingProvider(false);
        setMoveProviderData({ providerId: null, targetDeptId: "" });
    };

    const startAddProvider = (deptId) => {
        setProviderData(prev => ({ ...prev, department: deptId }));
        setIsAddingProvider(true);
        handleCloseContextMenu();
    };

    const startEditDepartment = (deptId) => {
        const dept = departments.find(d => d.id === deptId);
        if (dept) {
            setDeptName(dept.name);
            setEditingDeptId(deptId);
            setIsEditingDept(true);
        }
        handleCloseContextMenu();
    };

    const startEditProvider = (provId) => {
        const prov = providers.find(p => p.id === provId);
        if (prov) {
            setProviderData({
                name: prov.name,
                specialty: prov.specialty || "",
                department: prov.department
            });
            setEditingProviderId(provId);
            setIsEditingProvider(true);
        }
        handleCloseContextMenu();
    };

    const startMoveProvider = (provId) => {
        setMoveProviderData(prev => ({ ...prev, providerId: provId }));
        setIsMovingProvider(true);
        handleCloseContextMenu();
    };


    const renderContent = () => {
        if (isAddingDept) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Department Name"
                        value={deptName}
                        onChange={e => setDeptName(e.target.value)}
                        autoFocus
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => setIsAddingDept(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleAddDepartment}>Add</Button>
                    </Box>
                </Box>
            );
        }

        if (isEditingDept) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Department Name"
                        value={deptName}
                        onChange={e => setDeptName(e.target.value)}
                        autoFocus
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => setIsEditingDept(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleEditDepartment}>Save</Button>
                    </Box>
                </Box>
            );
        }

        if (isAddingProvider) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Provider Name"
                        value={providerData.name}
                        onChange={e => setProviderData(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                    />
                    <TextField
                        label="Specialty"
                        value={providerData.specialty}
                        onChange={e => setProviderData(prev => ({ ...prev, specialty: e.target.value }))}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={providerData.department}
                            label="Department"
                            onChange={e => setProviderData(prev => ({ ...prev, department: e.target.value }))}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => setIsAddingProvider(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleAddProvider}>Add</Button>
                    </Box>
                </Box>
            );
        }

        if (isEditingProvider) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Provider Name"
                        value={providerData.name}
                        onChange={e => setProviderData(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                    />
                    <TextField
                        label="Specialty"
                        value={providerData.specialty}
                        onChange={e => setProviderData(prev => ({ ...prev, specialty: e.target.value }))}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={providerData.department}
                            label="Department"
                            onChange={e => setProviderData(prev => ({ ...prev, department: e.target.value }))}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => setIsEditingProvider(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleEditProvider}>Save</Button>
                    </Box>
                </Box>
            );
        }

        if (isMovingProvider) {
            const provider = providers.find(p => p.id === moveProviderData.providerId);
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>Moving Provider: <strong>{provider?.name}</strong></Box>
                    <FormControl fullWidth>
                        <InputLabel>Target Department</InputLabel>
                        <Select
                            value={moveProviderData.targetDeptId}
                            label="Target Department"
                            onChange={e => setMoveProviderData(prev => ({ ...prev, targetDeptId: e.target.value }))}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={() => setIsMovingProvider(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleMoveProvider}>Move</Button>
                    </Box>
                </Box>
            );
        }

        return (
            <TreeView
                aria-label="file system navigator"
                defaultCollapseIcon={<Icon>expand_more</Icon>}
                defaultExpandIcon={<Icon>chevron_right</Icon>}
                sx={{ overflowY: 'auto', flexGrow: 1 }}
            >
                {departments.map((dept) => (
                    <TreeItem
                        key={`dept-${dept.id}`}
                        itemId={`dept-${dept.id}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dept.id)}
                        label={
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
                                onContextMenu={(e) => handleContextMenu(e, 'dept', dept.id)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Icon sx={{ mr: 1, fontSize: 20 }}>apartment</Icon>
                                    {dept.name}
                                </Box>
                                <IconButton size="small" onClick={(e) => {
                                    e.stopPropagation();
                                    handleContextMenu(e, 'dept', dept.id);
                                }}>
                                    <Icon sx={{ fontSize: 16 }}>more_vert</Icon>
                                </IconButton>
                            </Box>
                        }
                    >
                        {providers.filter(p => p.department === dept.id).map(prov => (
                            <TreeItem
                                key={`prov-${prov.id}`}
                                itemId={`prov-${prov.id}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, prov.id)}
                                label={
                                    <Box
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
                                        onContextMenu={(e) => handleContextMenu(e, 'prov', prov.id, dept.id)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Icon sx={{ mr: 1, fontSize: 20 }}>person</Icon>
                                            {prov.name}
                                        </Box>
                                        <IconButton size="small" onClick={(e) => {
                                            e.stopPropagation();
                                            handleContextMenu(e, 'prov', prov.id, dept.id);
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
            title="Manage Departments"
            fullWidth
            maxWidth="md"
        >
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                {!isAddingDept && !isAddingProvider && !isMovingProvider && !isEditingDept && !isEditingProvider && (
                    <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={() => setIsAddingDept(true)}>
                        Add Department
                    </Button>
                )}
                {!isAddingDept && !isAddingProvider && !isMovingProvider && !isEditingDept && !isEditingProvider && (
                    <Button variant="outlined" startIcon={<Icon>person_add</Icon>} onClick={() => {
                        setIsAddingProvider(true);
                        setProviderData({ name: "", specialty: "", department: "" });
                    }}>
                        Add Provider
                    </Button>
                )}
            </Box>

            {renderContent()}

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
                {contextMenu?.type === 'dept' && (
                    <>
                        <MenuItem onClick={() => startAddProvider(contextMenu.id)}>Add Provider</MenuItem>
                        <MenuItem onClick={() => startEditDepartment(contextMenu.id)}>Edit Department</MenuItem>
                    </>
                )}
                {contextMenu?.type === 'prov' && (
                    <>
                        <MenuItem onClick={() => startMoveProvider(contextMenu.id)}>Move Provider</MenuItem>
                        <MenuItem onClick={() => startEditProvider(contextMenu.id)}>Edit Provider</MenuItem>
                    </>
                )}
            </Menu>
        </Window>
    );
};
