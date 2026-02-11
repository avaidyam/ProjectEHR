import React, { useState } from 'react';
import { MenuItem, Select, InputLabel, FormControl, Menu } from '@mui/material';
import { Box, Button, Window, TextField, TreeView, TreeItem, Icon, IconButton } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';

interface ManageDepartmentsWindowProps {
    open: boolean;
    onClose: () => void;
}

interface ContextMenuState {
    mouseX: number;
    mouseY: number;
    type: 'dept' | 'prov';
    id: string; // departments ID is num, provider is string. Convert to string for consistency? Or handle both.
    parentId?: string;
}

interface ProviderFormData {
    name: string;
    specialty: string;
    department: string;
}

interface MoveProviderData {
    providerId: string | null;
    targetDeptId: string;
}

export const ManageDepartmentsWindow: React.FC<ManageDepartmentsWindowProps> = ({ open, onClose }) => {
    const [departments, setDepartments] = useDatabase().departments() as [Database.Department[], any];
    const [providers, setProviders] = useDatabase().providers() as [Database.Provider[], any];

    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    // Dialog/Form states
    const [isAddingDept, setIsAddingDept] = useState(false);
    const [isAddingProvider, setIsAddingProvider] = useState(false);
    const [isMovingProvider, setIsMovingProvider] = useState(false);
    const [isEditingDept, setIsEditingDept] = useState(false);
    const [isEditingProvider, setIsEditingProvider] = useState(false);

    // Form Data
    const [deptName, setDeptName] = useState("");
    const [editingDeptId, setEditingDeptId] = useState<any>(null); // Dept ID

    const [providerData, setProviderData] = useState<ProviderFormData>({
        name: "",
        specialty: "",
        department: ""
    });
    const [editingProviderId, setEditingProviderId] = useState<string | null>(null);

    const [moveProviderData, setMoveProviderData] = useState<MoveProviderData>({
        providerId: null,
        targetDeptId: ""
    });

    const [draggedProviderId, setDraggedProviderId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, providerId: string) => {
        setDraggedProviderId(providerId);
        e.dataTransfer.setData("text/plain", providerId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetDeptId: string) => {
        e.preventDefault();
        const providerId = draggedProviderId;
        if (!providerId || !targetDeptId) return;

        setProviders((prev: Database.Provider[]) => prev.map((p: Database.Provider) =>
            p.id === (providerId as any)
                ? { ...p, department: targetDeptId as any }
                : p
        ));
        setDraggedProviderId(null);
    };

    const handleContextMenu = (event: React.MouseEvent, type: 'dept' | 'prov', id: any, parentId?: any) => {
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

        const maxId = departments.length > 0 ? Math.max(...departments.map(d => Number(d.id) || 0), 0) : 0;
        const newId = maxId + 1;
        const newDept: Database.Department = {
            id: newId as any,
            name: deptName,
            specialty: "General", // Default
            serviceArea: "Hospital" // Default
        };

        setDepartments((prev: Database.Department[]) => [...prev, newDept]);
        setDeptName("");
        setIsAddingDept(false);
    };

    const handleEditDepartment = () => {
        if (!deptName || !editingDeptId) return;

        setDepartments((prev: Database.Department[]) => prev.map((d: Database.Department) =>
            d.id === editingDeptId ? { ...d, name: deptName } : d
        ));

        setDeptName("");
        setEditingDeptId(null);
        setIsEditingDept(false);
    };

    const handleAddProvider = () => {
        if (!providerData.name || !providerData.department) return;

        const maxId = providers.length > 0 ? Math.max(...providers.map(p => parseInt(p.id as string) || 0), 0) : 0;
        const newId = (maxId + 1).toString();
        const newProvider: Database.Provider = {
            id: newId as any,
            name: providerData.name,
            specialty: providerData.specialty,
            department: providerData.department as any,
            role: "Provider" // Default
        };

        setProviders((prev: Database.Provider[]) => [...prev, newProvider]);
        setProviderData({ name: "", specialty: "", department: "" });
        setIsAddingProvider(false);
    };

    const handleEditProvider = () => {
        if (!providerData.name || !providerData.department || !editingProviderId) return;

        setProviders((prev: Database.Provider[]) => prev.map((p: Database.Provider) =>
            p.id === (editingProviderId as any)
                ? { ...p, name: providerData.name, specialty: providerData.specialty, department: providerData.department as any }
                : p
        ));

        setProviderData({ name: "", specialty: "", department: "" });
        setEditingProviderId(null);
        setIsEditingProvider(false);
    };

    const handleMoveProvider = () => {
        if (!moveProviderData.providerId || !moveProviderData.targetDeptId) return;

        setProviders((prev: Database.Provider[]) => prev.map((p: Database.Provider) =>
            p.id === (moveProviderData.providerId as any)
                ? { ...p, department: moveProviderData.targetDeptId as any }
                : p
        ));

        setIsMovingProvider(false);
        setMoveProviderData({ providerId: null, targetDeptId: "" });
    };

    const startAddProvider = (deptId: any) => {
        setProviderData(prev => ({ ...prev, department: deptId as string }));
        setIsAddingProvider(true);
        handleCloseContextMenu();
    };

    const startEditDepartment = (deptId: any) => {
        const dept = departments.find(d => d.id === deptId);
        if (dept) {
            setDeptName(dept.name);
            setEditingDeptId(deptId);
            setIsEditingDept(true);
        }
        handleCloseContextMenu();
    };

    const startEditProvider = (provId: string) => {
        const prov = providers.find(p => p.id === (provId as any));
        if (prov) {
            setProviderData({
                name: prov.name,
                specialty: prov.specialty || "",
                department: prov.department as string
            });
            setEditingProviderId(provId);
            setIsEditingProvider(true);
        }
        handleCloseContextMenu();
    };

    const startMoveProvider = (provId: string) => {
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeptName(e.target.value)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeptName(e.target.value)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProviderData(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                    />
                    <TextField
                        label="Specialty"
                        value={providerData.specialty}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProviderData(prev => ({ ...prev, specialty: e.target.value }))}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={providerData.department}
                            label="Department"
                            onChange={(e) => setProviderData(prev => ({ ...prev, department: e.target.value as string }))}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id as string} value={d.id as string}>{d.name}</MenuItem>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProviderData(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                    />
                    <TextField
                        label="Specialty"
                        value={providerData.specialty}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProviderData(prev => ({ ...prev, specialty: e.target.value }))}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={providerData.department}
                            label="Department"
                            onChange={(e) => setProviderData(prev => ({ ...prev, department: e.target.value as string }))}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id as string} value={d.id as string}>{d.name}</MenuItem>
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
            const provider = providers.find(p => p.id === (moveProviderData.providerId as any));
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>Moving Provider: <strong>{provider?.name}</strong></Box>
                    <FormControl fullWidth>
                        <InputLabel>Target Department</InputLabel>
                        <Select
                            value={moveProviderData.targetDeptId}
                            label="Target Department"
                            onChange={(e) => setMoveProviderData(prev => ({ ...prev, targetDeptId: e.target.value as string }))}
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id as string} value={d.id as string}>{d.name}</MenuItem>
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
                        onDrop={(e: any) => handleDrop(e, dept.id as string)}
                        label={
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
                                onContextMenu={(e: any) => handleContextMenu(e, 'dept', dept.id)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Icon sx={{ mr: 1, fontSize: 20 }}>apartment</Icon>
                                    {dept.name}
                                </Box>
                                <IconButton size="small" onClick={(e: any) => {
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
                                className="draggable" // Add class for draggable? Or just rely on draggable attr
                                // draggable
                                onDragStart={(e: any) => handleDragStart(e, prov.id as string)}
                                label={
                                    <Box
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
                                        onContextMenu={(e: any) => handleContextMenu(e, 'prov', prov.id, dept.id)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Icon sx={{ mr: 1, fontSize: 20 }}>person</Icon>
                                            {prov.name}
                                        </Box>
                                        <IconButton size="small" onClick={(e: any) => {
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
                    <Box>
                        <MenuItem onClick={() => startAddProvider(contextMenu.id)}>Add Provider</MenuItem>
                        <MenuItem onClick={() => startEditDepartment(contextMenu.id)}>Edit Department</MenuItem>
                    </Box>
                )}
                {contextMenu?.type === 'prov' && (
                    <Box>
                        <MenuItem onClick={() => startMoveProvider(contextMenu.id)}>Move Provider</MenuItem>
                        <MenuItem onClick={() => startEditProvider(contextMenu.id)}>Edit Provider</MenuItem>
                    </Box>
                )}
            </Menu>
        </Window>
    );
};
