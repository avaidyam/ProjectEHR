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

    // Form Data
    const [deptName, setDeptName] = useState("");

    const [providerData, setProviderData] = useState({
        name: "",
        specialty: "",
        department: "" // dept ID
    });

    const [moveProviderData, setMoveProviderData] = useState({
        providerId: null,
        targetDeptId: ""
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
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                // Other native context menus might behave different.
                // With this behavior we prevent contextmenu from the backdrop to re-locate existing context menus.
                null,
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

    const startMoveProvider = (provId) => {
        setMoveProviderData(prev => ({ ...prev, providerId: provId }));
        setIsMovingProvider(true);
        handleCloseContextMenu();
    };

    const items = React.useMemo(() => {
        return departments.map(d => ({
            id: `dept-${d.id}`,
            label: d.name,
            children: providers.filter(p => p.department === d.id).map(p => ({
                id: `prov-${p.id}`,
                label: p.name
            }))
        }));
    }, [departments, providers]);

    // Handle item reordering/moving
    const handleItemOrderChange = (params) => {
        if (!params) return;

        const item = params.item || (params.items && params.items[0]);
        const newParent = params.newParent;

        if (item && newParent) {
            const itemId = item.id;
            const newParentId = newParent.id;

            if (itemId.startsWith('prov-') && newParentId.startsWith('dept-')) {
                const realProviderId = itemId.split('-')[1];
                const realDeptId = newParentId.split('-')[1];

                setProviders(prev => prev.map(p =>
                    p.id === realProviderId
                        ? { ...p, department: realDeptId }
                        : p
                ));
            }
        }
    };

    const CustomTreeItem = React.forwardRef((props, ref) => {
        const { id, label, ...other } = props;

        // Defensive: RichTreeView might render something else or id might be missing in some internal slots? 
        // Usually safe if we are replacing 'item'.
        if (!id) return <TreeItem ref={ref} {...props} />;

        const isDept = id.startsWith('dept-');
        const isProv = id.startsWith('prov-');
        const realId = id.split('-')[1];

        return (
            <TreeItem
                ref={ref}
                {...props}
                label={
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, width: '100%' }}
                        onContextMenu={(e) => {
                            if (isDept) handleContextMenu(e, 'dept', realId);
                            if (isProv) handleContextMenu(e, 'prov', realId);
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Icon sx={{ mr: 1, fontSize: 20 }}>{isDept ? 'apartment' : 'person'}</Icon>
                            {label}
                        </Box>
                        <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            if (isDept) handleContextMenu(e, 'dept', realId);
                            if (isProv) handleContextMenu(e, 'prov', realId);
                        }}>
                            <Icon sx={{ fontSize: 16 }}>more_vert</Icon>
                        </IconButton>
                    </Box>
                }
            />
        );
    });

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
                rich={true}
                items={items}
                aria-label="file system navigator"
                defaultCollapseIcon={<Icon>expand_more</Icon>}
                defaultExpandIcon={<Icon>chevron_right</Icon>}
                experimentalFeatures={{ itemsReordering: true }}
                onItemOrderChange={handleItemOrderChange}
                sx={{ overflowY: 'auto', flexGrow: 1 }}
                slots={{ item: CustomTreeItem }}
            />
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
                {!isAddingDept && !isAddingProvider && !isMovingProvider && (
                    <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={() => setIsAddingDept(true)}>
                        Add Department
                    </Button>
                )}
                {!isAddingDept && !isAddingProvider && !isMovingProvider && (
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
                    <MenuItem onClick={() => startAddProvider(contextMenu.id)}>Add Provider</MenuItem>
                )}
                {contextMenu?.type === 'prov' && (
                    <MenuItem onClick={() => startMoveProvider(contextMenu.id)}>Move Provider</MenuItem>
                )}
            </Menu>
        </Window>
    );
};
