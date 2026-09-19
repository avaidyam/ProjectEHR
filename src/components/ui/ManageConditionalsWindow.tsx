import * as React from 'react'
import { Window, Grid, Box, Stack, Label, Icon, Divider, TreeView, TreeItem, Autocomplete, IconButton, Tooltip, Chip } from './Core'
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
  social: 'diversity_1',
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
      {open && mrn && encounterId ? (
        <ManageConditionalsContent mrn={mrn} encounterId={encounterId} />
      ) : (
        <Box p={3}>
          <Label>Please open a patient encounter to manage conditionals.</Label>
        </Box>
      )}
    </Window>
  )
}

const ManageConditionalsContent = ({ mrn, encounterId }: {
  mrn: Database.Patient.ID;
  encounterId: Database.Encounter.ID;
}) => {
  const [encounter, setEncounter] = useDatabase().patients[mrn].encounters[encounterId]()
  const [orderables] = useDatabase().orderables()
  const [flowsheets] = useDatabase().flowsheets()
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null)
  const [treeFilter, setTreeFilter] = React.useState('')

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
          const candidateKeys = [item?.id, itemPath, item?.test, item?.mrn, item?.diagnosis, item?.accessionNumber].filter(Boolean) as string[]
          const resolvedKey = candidateKeys.find(k => (encounter.conditionals as any)?.[k]?.length > 0) || (item?.id ? item.id : itemPath)
          const count = (encounter.conditionals as any)?.[resolvedKey]?.length || 0

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
  const candidateKeys = [selectedItem?.id, selectedPath, selectedItem?.test, selectedItem?.mrn, selectedItem?.diagnosis, selectedItem?.accessionNumber].filter(Boolean) as string[]
  const keyToUse = candidateKeys.find(k => (encounter?.conditionals as any)?.[k]?.length > 0) || (selectedItem?.id ? selectedItem.id : selectedPath) || ''

  // Conditional orders logic - normalized into groups of alternative orders: string[][]
  const conditionGroups: string[][] = React.useMemo(() => {
    const raw = encounter?.conditionals?.[keyToUse]
    if (!raw || !Array.isArray(raw)) return []
    return raw.map(item => Array.isArray(item) ? item : [item]).filter(g => g.length > 0)
  }, [encounter?.conditionals, keyToUse])

  const resolveOrderName = (orderId: string) => {
    if ((orderables as any)?.procedures?.[orderId]) return (orderables as any).procedures[orderId]
    const medication = (orderables as any)?.rxnorm?.find((rx: any) => rx.name === orderId || rx.code === orderId)
    if (medication) return medication.name
    return orderId
  }

  const updateConditionals = (newGroups: string[][]) => {
    if (!keyToUse) return
    const cleanGroups = newGroups
      .map(g => g.filter(Boolean))
      .filter(g => g.length > 0)

    // Backward-compatible serialization: single orders saved as string, multiple alternatives saved as string[]
    const serialized = cleanGroups.map(g => g.length === 1 ? g[0] : g)

    setEncounter(prev => ({
      ...(prev as any),
      conditionals: {
        ...(prev?.conditionals || {}),
        [keyToUse]: serialized
      }
    }))
  }

  const handleAddCondition = (newValue: any) => {
    if (!newValue || !keyToUse) return
    const orderId = typeof newValue === 'string' ? newValue : (newValue.id || newValue.code || newValue.name)
    if (!orderId) return
    updateConditionals([...conditionGroups, [orderId]])
  }

  const handleAddAlternative = (groupIndex: number, newValue: any) => {
    if (!newValue || !keyToUse) return
    const orderId = typeof newValue === 'string' ? newValue : (newValue.id || newValue.code || newValue.name)
    if (!orderId) return
    if (conditionGroups[groupIndex]?.includes(orderId)) return
    const newGroups = conditionGroups.map((g, i) => i === groupIndex ? [...g, orderId] : g)
    updateConditionals(newGroups)
  }

  const handleDeleteAlternative = (groupIndex: number, orderIndex: number) => {
    const newGroups = conditionGroups
      .map((g, i) => i === groupIndex ? g.filter((_, oi) => oi !== orderIndex) : g)
      .filter(g => g.length > 0)
    updateConditionals(newGroups)
  }

  const handleDeleteCondition = (groupIndex: number) => {
    const newGroups = conditionGroups.filter((_, i) => i !== groupIndex)
    updateConditionals(newGroups)
  }

  const handleMoveGroupUp = (index: number) => {
    if (index === 0) return
    const newGroups = [...conditionGroups]
    const temp = newGroups[index]
    newGroups[index] = newGroups[index - 1]
    newGroups[index - 1] = temp
    updateConditionals(newGroups)
  }

  const handleMoveGroupDown = (index: number) => {
    if (index === conditionGroups.length - 1) return
    const newGroups = [...conditionGroups]
    const temp = newGroups[index]
    newGroups[index] = newGroups[index + 1]
    newGroups[index + 1] = temp
    updateConditionals(newGroups)
  }

  if (!encounter) {
    return (
      <Box p={3}>
        <Label>Loading encounter data...</Label>
      </Box>
    )
  }

  return (
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
            {renderCategory('Social History', categoryIcons.social, encounter.history?.social || [], 'history.social', (_s: Database.SocialHistoryItem) => 'Social History')}
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
                    {(() => {
                      const flattenObject = (obj: any, prefix = ''): [string, any][] => {
                        return Object.entries(obj || {}).reduce((acc: [string, any][], [key, value]) => {
                          const newKey = prefix ? `${prefix}.${key}` : key;
                          if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                            acc.push(...flattenObject(value, newKey));
                          } else {
                            acc.push([newKey, value]);
                          }
                          return acc;
                        }, []);
                      };

                      const properties = flattenObject(selectedItem).filter(([key]) => key !== 'id');
                      return [
                        ['id', selectedItem?.id],
                        ...properties.sort(([a], [b]) => a.localeCompare(b))
                      ].map(([key, value]) => {
                        if (value === undefined || value === null || value === '') return null;

                        let displayValue = "";
                        if (Array.isArray(value)) {
                          displayValue = value.map(c => {
                            const k = c.name || c.id || c.label || '';
                            const v = c.value || c.result || c.state || '';
                            if (k && v !== undefined && v !== '') return `${k}=${v}`;
                            return k || v || String(c);
                          }).join(',');
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
                      });
                    })()}
                  </Stack>
                </Box>

                {/* Add new condition (AND) */}
                <Box sx={{ mb: 1 }}>
                  <Label variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
                    ADD NEW REQUIRED CONDITION (AND)
                  </Label>
                  <OrderSelectField
                    value={null}
                    onChange={() => { }}
                    onSelect={handleAddCondition}
                    label="Search to add new condition (AND)..."
                    size="small"
                    fullWidth
                  />
                </Box>

                {conditionGroups.length === 0 ? (
                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Label variant="body2" color="textSecondary" align="center">
                      No conditional orders defined for this item.
                    </Label>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {conditionGroups.map((group, gIdx) => {
                      const isOrderPlaced = (order: string) => {
                        const orderName = resolveOrderName(order)
                        return encounter.orders?.some((o: any) =>
                          (!o.discontinueDate && o.status !== 'discontinued') &&
                          (o.id === order || o.code === order || o.name === orderName || o.name === order)
                        )
                      }
                      const isGroupSatisfied = group.some(isOrderPlaced)

                      return (
                        <React.Fragment key={`group-${gIdx}`}>
                          {gIdx > 0 && (
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 0.5 }}>
                              <Divider sx={{ flexGrow: 1 }} />
                              <Chip
                                size="small"
                                sx={{
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  height: 22
                                }}
                              >
                                AND
                              </Chip>
                              <Divider sx={{ flexGrow: 1 }} />
                            </Stack>
                          )}

                          <Box
                            sx={{
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: isGroupSatisfied ? 'success.light' : 'divider',
                              p: 1.5,
                              boxShadow: 1
                            }}
                          >
                            {/* Condition Header */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Icon size={18} color={isGroupSatisfied ? "success" : "action"}>
                                  {isGroupSatisfied ? "check_circle" : "pending"}
                                </Icon>
                                <Label bold variant="body2">
                                  Condition {gIdx + 1}
                                </Label>
                                {group.length > 1 && (
                                  <Chip
                                    size="small"
                                    color="secondary"
                                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                                  >
                                    Any order fulfills this condition (OR)
                                  </Chip>
                                )}
                              </Stack>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton size="small" disabled={gIdx === 0} onClick={() => handleMoveGroupUp(gIdx)} iconProps={{ size: 18 }}>expand_less</IconButton>
                                <IconButton size="small" disabled={gIdx === conditionGroups.length - 1} onClick={() => handleMoveGroupDown(gIdx)} iconProps={{ size: 18 }}>expand_more</IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteCondition(gIdx)} iconProps={{ size: 18 }}>delete</IconButton>
                              </Stack>
                            </Stack>

                            {/* Alternative Orders in this Condition */}
                            <Stack spacing={1}>
                              {group.map((order, oIdx) => {
                                const orderName = resolveOrderName(order)
                                const isPlaced = isOrderPlaced(order)

                                return (
                                  <React.Fragment key={`${order}-${oIdx}`}>
                                    {oIdx > 0 && (
                                      <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 2, my: -0.25 }}>
                                        <Divider sx={{ width: 16 }} />
                                        <Label variant="caption" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '0.7rem' }}>
                                          OR
                                        </Label>
                                        <Divider sx={{ flexGrow: 1 }} />
                                      </Stack>
                                    )}
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      sx={{
                                        p: 0.75,
                                        borderRadius: 1,
                                        bgcolor: isPlaced ? 'success.50' : 'grey.100',
                                        border: '1px solid',
                                        borderColor: isPlaced ? 'success.main' : 'transparent'
                                      }}
                                    >
                                      <Icon size={16} color={isPlaced ? "success" : "action"} sx={{ mr: 1 }}>
                                        {isPlaced ? "check_circle" : "radio_button_unchecked"}
                                      </Icon>
                                      <Stack direction="column" sx={{ flexGrow: 1 }}>
                                        <Label bold variant="body2">{orderName}</Label>
                                        {order !== orderName && (
                                          <Label variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                            Code: {order}
                                          </Label>
                                        )}
                                      </Stack>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteAlternative(gIdx, oIdx)}
                                        iconProps={{ size: 18 }}
                                        title="Remove this order alternative"
                                      >
                                        close
                                      </IconButton>
                                    </Stack>
                                  </React.Fragment>
                                )
                              })}

                              {/* Inline adder for alternative order (OR) */}
                              <Box sx={{ pt: 0.5 }}>
                                <OrderSelectField
                                  value={null}
                                  onChange={() => { }}
                                  onSelect={(val) => handleAddAlternative(gIdx, val)}
                                  size="small"
                                  label="+ Add alternative order to this condition (OR)..."
                                  fullWidth
                                />
                              </Box>
                            </Stack>
                          </Box>
                        </React.Fragment>
                      )
                    })}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
  )
}

