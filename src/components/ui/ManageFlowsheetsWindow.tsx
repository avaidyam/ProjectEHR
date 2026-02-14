import * as React from 'react';
import { Menu } from '@mui/material';
import { Box, Button, Window, TreeView, TreeItem, Icon, IconButton, Divider, Autocomplete, MenuItem } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';

interface ManageFlowsheetsWindowProps {
  open: boolean;
  onClose: () => void;
}

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  type: 'group' | 'row';
  id: string; // Group ID or Row Name
  parentId?: string; // Group ID if row
}

interface GroupData {
  id: string;
  name: string;
}

interface RowData {
  name: string;
  label: string;
  category: string;
  type: string;
  targetGroupId: string;
}

export const ManageFlowsheetsWindow: React.FC<ManageFlowsheetsWindowProps> = ({ open, onClose }) => {
  const [flowsheets, setFlowsheets] = useDatabase().flowsheets()
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(null);
  const [isAddingGroup, setIsAddingGroup] = React.useState(false);
  const [isEditingGroup, setIsEditingGroup] = React.useState(false);
  const [isAddingRow, setIsAddingRow] = React.useState(false);
  const [isEditingRow, setIsEditingRow] = React.useState(false);
  const [groupData, setGroupData] = React.useState<GroupData>({ id: "", name: "" });
  const [rowData, setRowData] = React.useState<RowData>({
    name: "", // check unique within group? or globally? assuming globally or within group.
    label: "",
    category: "",
    type: "number",
    targetGroupId: ""
  });

  const handleContextMenu = (event: React.MouseEvent, type: 'group' | 'row', id: string, parentId?: string) => {
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
    setFlowsheets((prev) => [...prev, {
      id: Database.Flowsheet.Definition.ID.create(),
      name: groupData.name,
      rows: []
    }]);
    setGroupData({ id: "", name: "" });
    setIsAddingGroup(false);
  };

  const handleEditGroup = () => {
    if (!groupData.name || !groupData.id) return;
    setFlowsheets((prev) => prev.map((g) => g.id === groupData.id ? { ...g, name: groupData.name } : g));
    setGroupData({ id: "", name: "" });
    setIsEditingGroup(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group and all its rows?")) {
      setFlowsheets((prev: Database.Flowsheet.Definition[]) => prev.filter((g: Database.Flowsheet.Definition) => g.id !== groupId));
    }
    handleCloseContextMenu();
  };

  const startAddGroup = () => {
    setGroupData({ id: "", name: "" });
    setIsAddingGroup(true);
    handleCloseContextMenu();
  }
  const startEditGroup = (groupId: string) => {
    const group = flowsheets.find(g => g.id === groupId);
    if (group) {
      setGroupData({ id: group.id, name: group.name || "" });
      setIsEditingGroup(true);
    }
    handleCloseContextMenu();
  };

  // --- ROW ACTIONS ---

  const handleAddRow = () => {
    if (!rowData.name || !rowData.label || !rowData.targetGroupId) return;

    setFlowsheets((prev) => prev.map((g) => {
      if (g.id === rowData.targetGroupId) {
        // Check name uniqueness in group
        if (g.rows?.some((r) => r.name === rowData.name)) {
          window.alert("Row Name must be unique within the group.");
          return g; // TODO: prevent proper return?
        }
        const newRow: Database.Flowsheet.Definition.Row = {
          name: rowData.name,
          label: rowData.label,
          category: rowData.category,
          type: rowData.type,
          options: []
        };
        return {
          ...g,
          rows: [...(g.rows || []), newRow]
        };
      }
      return g;
    }));

    setRowData({ name: "", label: "", category: "", type: "number", targetGroupId: "" });
    setIsAddingRow(false);
  };

  const handleEditRow = () => {
    if (!rowData.name || !rowData.label || !rowData.targetGroupId) return; // targetGroupId here acts as the parent group ID we are editing in

    setFlowsheets((prev) => prev.map((g) => {
      if (g.id === rowData.targetGroupId) {
        return {
          ...g,
          rows: g.rows?.map((r) => r.name === rowData.name ? { ...r, label: rowData.label, category: rowData.category, type: rowData.type } : r)
        };
      }
      return g;
    }));

    setRowData({ name: "", label: "", category: "", type: "number", targetGroupId: "" });
    setIsEditingRow(false);
  };

  const handleDeleteRow = (rowName: string, groupId: string) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      setFlowsheets((prev) => prev.map((g) => {
        if (g.id === groupId) {
          return { ...g, rows: g.rows?.filter((r) => r.name !== rowName) };
        }
        return g;
      }));
    }
    handleCloseContextMenu();
  };

  const startAddRow = (groupId: string) => {
    setRowData({ name: "", label: "", category: "", type: "number", targetGroupId: groupId });
    setIsAddingRow(true);
    handleCloseContextMenu();
  };

  const startEditRow = (rowName: string, groupId: string) => {
    const group = flowsheets.find(g => g.id === groupId);
    const row = group?.rows?.find(r => r.name === rowName);
    if (row) {
      setRowData({
        name: row.name,
        label: row.label,
        category: row.category || "",
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
          <Autocomplete
            freeSolo
            label="Group Name"
            fullWidth
            value={groupData.name}
            onInputChange={(_e, newValue) => setGroupData(prev => ({ ...prev, name: newValue }))}
            autoFocus
            options={[]}
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
          <Autocomplete
            freeSolo
            label="Name (ID)"
            fullWidth
            value={rowData.name}
            onInputChange={(_e, newValue) => setRowData(prev => ({ ...prev, name: newValue }))}
            TextFieldProps={{ disabled: isEditingRow, required: true }}
            options={[]}
          />
          <Autocomplete
            freeSolo
            label="Label (Display Name)"
            fullWidth
            value={rowData.label}
            onInputChange={(_e, newValue) => setRowData(prev => ({ ...prev, label: newValue }))}
            TextFieldProps={{ required: true, autoFocus: isEditingRow }}
            options={[]}
          />
          <Autocomplete
            freeSolo
            label="Category"
            fullWidth
            value={rowData.category}
            onInputChange={(_e, newValue) => setRowData(prev => ({ ...prev, category: newValue }))}
            options={[]}
          />
          <Autocomplete
            label="Type"
            options={['number', 'string', 'select']}
            value={rowData.type}
            onChange={(_e, newValue) => setRowData(prev => ({ ...prev, type: newValue as string }))}
            getOptionLabel={(option) => typeof option === 'string' ? option.charAt(0).toUpperCase() + option.slice(1) : option}
          />

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
            key={`group - ${group.id} `}
            itemId={`group - ${group.id} `}
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
            {group.rows?.map(row => (
              <TreeItem
                key={`row - ${row.name} `}
                itemId={`row - ${row.name} `}
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
          <Box>
            <MenuItem onClick={() => startAddRow(contextMenu.id)}>Add Row</MenuItem>
            <MenuItem onClick={() => startEditGroup(contextMenu.id)}>Rename Group</MenuItem>
            <Divider />
            <MenuItem onClick={() => handleDeleteGroup(contextMenu.id)} sx={{ color: 'error.main' }}>Delete Group</MenuItem>
          </Box>
        )}
        {contextMenu?.type === 'row' && (
          <Box>
            <MenuItem onClick={() => startEditRow(contextMenu.id, contextMenu.parentId!)}>Edit Row</MenuItem>
            <Divider />
            <MenuItem onClick={() => handleDeleteRow(contextMenu.id, contextMenu.parentId!)} sx={{ color: 'error.main' }}>Delete Row</MenuItem>
          </Box>
        )}
      </Menu>
    </Window>
  );
};
