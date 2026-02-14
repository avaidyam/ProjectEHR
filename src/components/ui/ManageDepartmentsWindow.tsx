import * as React from 'react';
import { Menu } from '@mui/material';
import { Box, Button, Window, TreeView, TreeItem, Icon, IconButton, Autocomplete, MenuItem } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  type: 'dept' | 'prov';
  id: string;
  parentId?: string;
}

interface ProviderFormData {
  name?: string;
  specialty?: Database.Specialty;
  department?: Database.Department.ID;
}

interface MoveProviderData {
  providerId: Database.Provider.ID | null;
  targetDeptId: Database.Department.ID | null;
}

export const ManageDepartmentsWindow = ({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) => {
  const [departments, setDepartments] = useDatabase().departments()
  const [providers, setProviders] = useDatabase().providers()

  const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(null);

  // Dialog/Form states
  const [isAddingDept, setIsAddingDept] = React.useState(false);
  const [isAddingProvider, setIsAddingProvider] = React.useState(false);
  const [isMovingProvider, setIsMovingProvider] = React.useState(false);
  const [isEditingDept, setIsEditingDept] = React.useState(false);
  const [isEditingProvider, setIsEditingProvider] = React.useState(false);

  // Form Data
  const [deptName, setDeptName] = React.useState("");
  const [editingDeptId, setEditingDeptId] = React.useState<Database.Department.ID | null>(null);

  const [providerData, setProviderData] = React.useState<ProviderFormData>({});
  const [editingProviderId, setEditingProviderId] = React.useState<string | null>(null);

  const [moveProviderData, setMoveProviderData] = React.useState<MoveProviderData>({
    providerId: null,
    targetDeptId: null
  });

  const [draggedProviderId, setDraggedProviderId] = React.useState<Database.Provider.ID | null>(null);

  const handleDragStart = (e: React.DragEvent, providerId: Database.Provider.ID) => {
    setDraggedProviderId(providerId);
    e.dataTransfer.setData("text/plain", providerId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDeptId: Database.Department.ID) => {
    e.preventDefault();
    const providerId = draggedProviderId;
    if (!providerId || !targetDeptId) return;

    setProviders((prev) => prev.map((p) =>
      p.id === (providerId)
        ? { ...p, department: targetDeptId! }
        : p
    ));
    setDraggedProviderId(null);
  };

  const handleContextMenu = (event: React.MouseEvent, type: 'dept' | 'prov', id: Database.Department.ID | Database.Provider.ID, parentId?: Database.Department.ID) => {
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
    setDepartments((prev: Database.Department[]) => [...prev, {
      id: Database.Department.ID.create(),
      name: deptName,
      specialty: "General" as Database.Specialty,
      serviceArea: "Hospital" as Database.ServiceArea
    }]);
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
    setProviders((prev) => [...prev, {
      id: Database.Provider.ID.create(),
      name: providerData.name!,
      specialty: providerData.specialty!,
      department: providerData.department!,
      role: "Provider"
    }]);
    setProviderData({});
    setIsAddingProvider(false);
  };

  const handleEditProvider = () => {
    if (!providerData.name || !providerData.department || !editingProviderId) return;

    setProviders((prev) => prev.map((p) =>
      p.id === editingProviderId
        ? { ...p, name: providerData!.name!, specialty: providerData!.specialty!, department: providerData!.department! }
        : p
    ));

    setProviderData({});
    setEditingProviderId(null);
    setIsEditingProvider(false);
  };

  const handleMoveProvider = () => {
    if (!moveProviderData.providerId || !moveProviderData.targetDeptId) return;
    setProviders((prev) => prev.map((p) =>
      p.id === moveProviderData.providerId
        ? { ...p, department: moveProviderData.targetDeptId! }
        : p
    ));
    setIsMovingProvider(false);
    setMoveProviderData({ providerId: null, targetDeptId: null });
  };

  const startAddProvider = (deptId: Database.Department.ID) => {
    setProviderData(prev => ({ ...prev, department: deptId }));
    setIsAddingProvider(true);
    handleCloseContextMenu();
  };

  const startEditDepartment = (deptId: Database.Department.ID) => {
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
      setDeptName(dept.name);
      setEditingDeptId(deptId);
      setIsEditingDept(true);
    }
    handleCloseContextMenu();
  };

  const startEditProvider = (provId: Database.Provider.ID) => {
    const prov = providers.find(p => p.id === provId);
    if (prov) {
      setProviderData({
        name: prov.name,
        specialty: prov.specialty,
        department: prov.department
      })
      setEditingProviderId(provId);
      setIsEditingProvider(true);
    }
    handleCloseContextMenu();
  };

  const startMoveProvider = (provId: Database.Provider.ID) => {
    setMoveProviderData(prev => ({ ...prev, providerId: provId }));
    setIsMovingProvider(true);
    handleCloseContextMenu();
  };


  const renderContent = () => {
    if (isAddingDept) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            freeSolo
            label="Department Name"
            fullWidth
            value={deptName}
            onInputChange={(_e, newValue) => setDeptName(newValue)}
            autoFocus
            options={[]}
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
          <Autocomplete
            freeSolo
            label="Department Name"
            fullWidth
            value={deptName}
            onInputChange={(_e, newValue) => setDeptName(newValue)}
            autoFocus
            options={[]}
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
          <Autocomplete
            freeSolo
            label="Provider Name"
            fullWidth
            value={providerData.name}
            onInputChange={(_e, newValue) => setProviderData(prev => ({ ...prev, name: newValue }))}
            autoFocus
            options={[]}
          />
          <Autocomplete
            freeSolo
            label="Specialty"
            fullWidth
            value={providerData.specialty}
            onInputChange={(_e, newValue) => setProviderData(prev => ({ ...prev, specialty: newValue as Database.Specialty }))}
            options={Database.Specialty.SPECIALTIES}
          />
          <Autocomplete
            label="Department"
            options={departments}
            value={departments.find(d => d.id === providerData.department)}
            onChange={(_e, newValue: any) => setProviderData(prev => ({ ...prev, department: newValue?.id }))}
            getOptionLabel={(option: any) => option.name}
          />
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
          <Autocomplete
            freeSolo
            label="Provider Name"
            fullWidth
            value={providerData.name}
            onInputChange={(_e, newValue) => setProviderData(prev => ({ ...prev, name: newValue }))}
            autoFocus
            options={[]}
          />
          <Autocomplete
            freeSolo
            label="Specialty"
            fullWidth
            value={providerData.specialty}
            onInputChange={(_e, newValue) => setProviderData(prev => ({ ...prev, specialty: newValue as Database.Specialty }))}
            options={Database.Specialty.SPECIALTIES}
          />
          <Autocomplete
            label="Department"
            options={departments}
            value={departments.find(d => d.id === providerData.department)}
            onChange={(_e, newValue: any) => setProviderData(prev => ({ ...prev, department: newValue?.id }))}
            getOptionLabel={(option: any) => option.name}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setIsEditingProvider(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditProvider}>Save</Button>
          </Box>
        </Box>
      );
    }

    if (isMovingProvider) {
      const provider = providers.find(p => p.id === (moveProviderData.providerId));
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>Moving Provider: <strong>{provider?.name}</strong></Box>
          <Autocomplete
            label="Target Department"
            options={departments}
            value={departments.find(d => d.id === moveProviderData.targetDeptId)}
            onChange={(_e, newValue: any) => setMoveProviderData(prev => ({ ...prev, targetDeptId: newValue?.id }))}
            getOptionLabel={(option: any) => option.name}
          />
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
            onDrop={(e) => handleDrop(e, dept.id as Database.Department.ID)}
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
                className="draggable" // Add class for draggable? Or just rely on draggable attr
                // draggable
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
            setProviderData({});
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
            <MenuItem onClick={() => startAddProvider(contextMenu.id as Database.Department.ID)}>Add Provider</MenuItem>
            <MenuItem onClick={() => startEditDepartment(contextMenu.id as Database.Department.ID)}>Edit Department</MenuItem>
          </Box>
        )}
        {contextMenu?.type === 'prov' && (
          <Box>
            <MenuItem onClick={() => startMoveProvider(contextMenu.id as Database.Provider.ID)}>Move Provider</MenuItem>
            <MenuItem onClick={() => startEditProvider(contextMenu.id as Database.Provider.ID)}>Edit Provider</MenuItem>
          </Box>
        )}
      </Menu>
    </Window>
  );
};
