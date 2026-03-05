import * as React from 'react'
import { Window, Grid, Box, Stack, Label, Icon, Divider, TreeView, TreeItem, Autocomplete, IconButton, Tooltip } from './Core'
import { OrderSelectField } from './DataUI'
import { useDatabase } from '../contexts/PatientContext'
import * as Database from '../contexts/Database'

const categoryIcons: Record<string, string> = {
  problems: 'medical_services',
  allergies: 'vaccines',
  immunizations: 'biotech',
  medicalHistory: 'history_edu',
  surgicalHistory: 'precision_manufacturing',
  familyStatus: 'people',
  familyHistory: 'diversity_1',
  medications: 'medication',
  labs: 'science',
  imaging: 'image',
  orders: 'assignment',
  flowsheets: 'analytics',
  notes: 'description'
}

export const ManageConditionalsWindow = ({ open, onClose, mrn, encounterId }: {
  open: boolean;
  onClose: () => void;
  mrn: Database.Patient.ID;
  encounterId: Database.Encounter.ID;
}) => {
  const [encounter, setEncounter] = useDatabase().patients[mrn]?.encounters[encounterId]()
  const [orderables] = useDatabase().orderables()
  const [flowsheets] = useDatabase().flowsheets()
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null)
  const [treeFilter, setTreeFilter] = React.useState('')

  if (!encounter) return null

  const getFlowsheetName = (definitionId: Database.Flowsheet.Definition.ID) => {
    return (flowsheets as Database.Flowsheet.Definition[] || []).find(f => f.id === definitionId)?.name || 'Unknown Flowsheet'
  }

  const renderCategory = (label: string, icon: string, items: any[], path: string, itemLabelFn: (item: any) => string) => {
    const filteredItems = (items ?? []).filter(item =>
      !treeFilter || itemLabelFn(item).toLowerCase().includes(treeFilter.toLowerCase())
    )
    if (!filteredItems.length && !!treeFilter) return null

    return (
      <TreeItem
        itemId={path}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon color="primary" size={18}>{icon}</Icon>
            <Label variant="body2" bold>{label}</Label>
            <Label variant="caption" color="textSecondary" sx={{ opacity: 0.7 }}>({filteredItems.length})</Label>
          </Stack>
        }
      >
        {filteredItems.map((item, idx) => {
          const realIdx = items.indexOf(item)
          const itemPath = `${path}.${realIdx}`
          const itemId = item?.id || item?.mrn || item?.diagnosis || 'N/A'
          const itemKey = (itemId !== 'N/A' ? itemId : itemPath) || ''
          const count = (encounter.conditionals as any)?.[itemKey]?.length || 0

          return (
            <TreeItem
              key={itemPath}
              itemId={itemPath}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Label variant="body2">{itemLabelFn(item)}</Label>
                  <Label variant="caption" color="textSecondary" sx={{ opacity: 0.7 }}>
                    ({count})
                  </Label>
                </Stack>
              }
            />
          )
        })}
      </TreeItem>
    )
  }

  const getSelectedItem = (path: string | null) => {
    if (!path || !encounter) return null
    try {
      return path.split('.').reduce((acc, part) => (acc as any)?.[part], encounter as any)
    } catch (e) {
      return null
    }
  }

  const selectedItem = getSelectedItem(selectedPath) as any
  const selectedId = selectedItem?.id || selectedItem?.mrn || selectedItem?.diagnosis || 'N/A'
  const keyToUse = (selectedId !== 'N/A' ? selectedId : selectedPath) || ''

  // Conditional orders logic - check both ID and path
  const conditionalOrders = encounter?.conditionals?.[keyToUse] || []

  const resolveOrderName = (orderId: string) => {
    if ((orderables as any)?.procedures?.[orderId]) return (orderables as any).procedures[orderId]
    const medication = (orderables as any)?.rxnorm?.find((rx: any) => rx.name === orderId)
    if (medication) return medication.name
    return orderId
  }

  const updateConditionals = (newOrders: string[]) => {
    if (!keyToUse) return
    setEncounter(prev => ({
      ...(prev as any),
      conditionals: {
        ...(prev?.conditionals || {}),
        [keyToUse]: newOrders
      }
    }))
  }

  const handleAddConditional = (newValue: any) => {
    if (!newValue || !keyToUse) return
    const orderId = typeof newValue === 'string' ? newValue : newValue.id
    if (!orderId) return
    updateConditionals([...conditionalOrders, orderId])
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newOrders = [...conditionalOrders]
    const temp = newOrders[index]
    newOrders[index] = newOrders[index - 1]
    newOrders[index - 1] = temp
    updateConditionals(newOrders)
  }

  const handleMoveDown = (index: number) => {
    if (index === conditionalOrders.length - 1) return
    const newOrders = [...conditionalOrders]
    const temp = newOrders[index]
    newOrders[index] = newOrders[index + 1]
    newOrders[index + 1] = temp
    updateConditionals(newOrders)
  }

  const handleDelete = (index: number) => {
    const newOrders = [...conditionalOrders]
    newOrders.splice(index, 1)
    updateConditionals(newOrders)
  }

  return (
    <Window
      title={(
        <Stack direction="row" spacing={1} alignItems="center">
          <Icon color="primary">settings_suggest</Icon>
          <Label variant="h6">Manage Conditionals</Label>
        </Stack>
      ) as any}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      ContentProps={{ sx: { p: 0, overflow: 'hidden' } }}
    >
      <Grid container sx={{ height: '70vh' }}>
        {/* Left Pane: Filtered Encounter Tree */}
        <Grid size={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Autocomplete
              fullWidth
              size="small"
              options={[]}
              freeSolo
              label="Filter clinical tree..."
              onChange={(_, val) => setTreeFilter(val as string)}
              onInputChange={(_, val) => setTreeFilter(val)}
            />
          </Box>
          <TreeView
            selectedItems={selectedPath}
            onSelectedItemsChange={(_, id) => setSelectedPath(id as string)}
            sx={{ flex: 1, overflow: 'auto', p: 1 }}
          >
            {renderCategory('Problems', categoryIcons.problems, encounter.problems || [], 'problems', (p: Database.Problem) => p.displayAs || p.diagnosis)}
            {renderCategory('Allergies', categoryIcons.allergies, encounter.allergies || [], 'allergies', (a: Database.Allergy) => a.allergen)}
            {renderCategory('Immunizations', categoryIcons.immunizations, encounter.immunizations || [], 'immunizations', (i: Database.Immunization) => i.vaccine)}
            {renderCategory('Medical History', categoryIcons.medicalHistory, encounter.history?.medical || [], 'history.medical', (m: Database.MedicalHistoryItem) => m.displayAs || m.diagnosis)}
            {renderCategory('Surgical History', categoryIcons.surgicalHistory, encounter.history?.surgical || [], 'history.surgical', (s: Database.SurgicalHistoryItem) => s.procedure)}
            {renderCategory('Family Status', categoryIcons.familyStatus, encounter.history?.familyStatus || [], 'history.familyStatus', (f: Database.FamilyStatusItem) => `${f.name} (${f.relationship})`)}
            {renderCategory('Family History', categoryIcons.familyHistory, encounter.history?.family || [], 'history.family', (h: Database.FamilyHistoryItem) => h.description)}
            {renderCategory('Medications', categoryIcons.medications, encounter.medications || [], 'medications', (m: Database.Medication) => m.name)}
            {renderCategory('Labs', categoryIcons.labs, encounter.labs || [], 'labs', (l: Database.Lab) => l.test)}
            {renderCategory('Imaging', categoryIcons.imaging, encounter.imaging || [], 'imaging', (i: Database.Imaging) => i.test)}
            {renderCategory('Orders', categoryIcons.orders, encounter.orders || [], 'orders', (o: Database.Order) => o.name)}
            {renderCategory('Flowsheets', categoryIcons.flowsheets, encounter.flowsheets || [], 'flowsheets', (f: Database.Flowsheet.Entry) => getFlowsheetName(f.flowsheet))}
            {renderCategory('Notes', categoryIcons.notes, encounter.notes || [], 'notes', (n: Database.Note) => `${n.type} (${new Date(n.date).toLocaleDateString()})`)}
          </TreeView>
        </Grid>

        {/* Right Pane: Conditional Orders */}
        <Grid size={6} sx={{ height: '100%', p: 3, bgcolor: 'grey.50', overflow: 'auto' }}>
          <Stack spacing={2}>
            <Label variant="subtitle1" bold sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon>shopping_cart_checkout</Icon> Conditional Orders
            </Label>

            {!selectedPath || !selectedPath.includes('.') ? (
              <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, textAlign: 'center' }}>
                <Icon size={48} sx={{ mb: 1 }}>touch_app</Icon>
                <Label variant="body2" color="textSecondary">
                  Select a clinical item from the tree to view its conditional ordering rules.
                </Label>
              </Box>
            ) : (
              <>
                <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.100' }}>
                  <Stack spacing={0.5}>
                    <Label bold variant="caption" color="primary" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Item Properties</Label>
                    {Object.entries(selectedItem || {})
                      .sort(([a], [b]) => a === 'id' ? -1 : b === 'id' ? 1 : 0)
                      .map(([key, value]) => {
                        let displayValue = "";
                        if (key === 'components' && Array.isArray(value)) {
                          displayValue = (value as any[]).map(c => {
                            const k = c.name || c.id || c.label || '';
                            const v = c.value || c.result || c.state || '';
                            if (k && v !== undefined && v !== '') return `${k}=${v}`;
                            return k || v || String(c);
                          }).join(',');
                        } else if (typeof value === 'object' && value !== null) {
                          return null;
                        } else {
                          displayValue = String(value);
                        }

                        if (key === 'image' && displayValue.length > 35) {
                          displayValue = displayValue.substring(0, 35) + '⋯';
                        }

                        return (
                          <Stack direction="row" key={key} justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.25 }}>
                            <Label variant="caption" sx={{ opacity: 0.6, fontSize: '0.7rem', fontWeight: 500, minWidth: '80px', pt: 0.2 }}>{key}</Label>
                            <Label variant="caption" sx={{
                              fontWeight: key === 'id' ? 'bold' : 'normal',
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              wordBreak: 'break-word',
                              textAlign: 'right',
                              flex: 1
                            }}>{displayValue}</Label>
                          </Stack>
                        );
                      })}
                  </Stack>
                </Box>

                <OrderSelectField
                  value={null}
                  onChange={() => { }}
                  onSelect={handleAddConditional}
                  size="small"
                  fullWidth
                />

                {conditionalOrders.length === 0 ? (
                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Label variant="body2" color="textSecondary" align="center">
                      No conditional orders defined for this item.
                    </Label>
                  </Box>
                ) : (
                  <TreeView sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {conditionalOrders.map((order: any, idx: number) => {
                      const orderName = resolveOrderName(order)
                      const isPlaced = encounter.orders?.some((o: any) => o.id === order || o.name === orderName)
                      return (
                        <TreeItem
                          key={`${order}-${idx}`}
                          itemId={`${order}-${idx}`}
                          label={
                            <Stack direction="row" alignItems="center" sx={{ width: '100%', py: 0.5 }}>
                              <Icon size={16} color={isPlaced ? "success" : "action"} sx={{ mr: 1 }}>
                                {isPlaced ? "check_circle" : "radio_button_unchecked"}
                              </Icon>
                              <Label bold variant="body2" sx={{ flexGrow: 1 }}>{orderName}</Label>
                              <Stack direction="row">
                                <IconButton size="small" disabled={idx === 0} onClick={() => handleMoveUp(idx)} iconProps={{ size: 18 }}>expand_less</IconButton>
                                <IconButton size="small" disabled={idx === conditionalOrders.length - 1} onClick={() => handleMoveDown(idx)} iconProps={{ size: 18 }}>expand_more</IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete(idx)} iconProps={{ size: 18 }}>delete</IconButton>
                              </Stack>
                            </Stack>
                          }
                        />
                      )
                    })}
                  </TreeView>
                )}
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Window>
  )
}
