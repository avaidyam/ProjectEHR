import * as React from 'react'
import { Window, Button, Stack, Label, Icon, Box, Grid, Divider, TreeView, TreeItem } from './Core'
import { useDatabase } from '../contexts/PatientContext'
import * as Database from '../contexts/Database'

const JSONTreeNode = ({ label, value, path }: { label: string; value: any; path: string }) => {
  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)

  if (isObject) {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return (
        <TreeItem
          itemId={path}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Label inline bold variant="body2">{label}:</Label>
              <Label inline color="textSecondary" variant="body2">{isArray ? '[]' : '{}'}</Label>
            </Box>
          }
        />
      )
    }

    return (
      <TreeItem
        itemId={path}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Label inline bold variant="body2">{label}</Label>
            <Label inline color="primary" variant="caption" sx={{ opacity: 0.7 }}>
              {isArray ? `[${value.length}]` : `{${keys.length}}`}
            </Label>
          </Box>
        }
      >
        {keys.map((key) => (
          <JSONTreeNode
            key={key}
            label={key}
            value={value[key]}
            path={`${path}.${key}`}
          />
        ))}
      </TreeItem>
    )
  }

  return (
    <TreeItem
      itemId={path}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
          <Label inline bold variant="body2" sx={{ minWidth: 100 }}>{label}:</Label>
          <Label
            inline
            variant="body2"
            sx={{
              color: typeof value === 'string' ? 'success.main' : (typeof value === 'number' ? 'info.main' : (typeof value === 'boolean' ? 'warning.main' : 'textSecondary')),
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}
          >
            {typeof value === 'string' ? `"${value}"` : String(value)}
          </Label>
        </Box>
      }
    />
  )
}

export const DatabaseManagementWindow = ({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) => {
  const [db, setDb] = useDatabase()()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `database_export_${Temporal.Now.plainDateISO().toString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        mergeDatabase(JSON.parse(e.target!.result as string))
      } catch (error) {
        console.error("Failed to parse JSON", error)
        window.alert("Failed to parse the selected JSON file.")
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const mergeDatabase = (importedData: Database.Root) => {
    let stats = {
      patientsAdded: 0,
      encountersAdded: 0,
      departmentsAdded: 0,
      otherRecordsAdded: 0
    }

    setDb((prevDb) => {
      // FIXME: Required because we're sequentially partial-merging parts of the incoming DB
      const newDb: any = { ...prevDb }
      Object.keys(importedData).forEach((__key) => {
        const key = __key as keyof Database.Root
        if (!newDb[key]) {
          newDb[key] = importedData[key]
          return
        }
        if (key === 'patients') {
          newDb.patients = { ...newDb.patients }
          const importedPatients = importedData.patients
          Object.keys(importedPatients).forEach(__pId => {
            const pId = __pId as keyof Database.Root['patients']
            if (!newDb.patients[pId]) {
              newDb.patients[pId] = importedPatients[pId]
              stats.patientsAdded++
            } else {
              const importedEncounters = importedPatients[pId].encounters
              if (importedEncounters) {
                newDb.patients[pId] = { ...newDb.patients[pId] }
                const currentEncounters = newDb.patients[pId].encounters || {}
                newDb.patients[pId].encounters = { ...currentEncounters }
                Object.keys(importedEncounters).forEach(__encId => {
                  const encId = __encId as keyof Database.Root['patients'][keyof Database.Root['patients']]['encounters']
                  if (!newDb.patients[pId].encounters[encId]) {
                    newDb.patients[pId].encounters[encId] = importedEncounters[encId]
                    stats.encountersAdded++
                  }
                })
              }
            }
          })
        } else {
          const importedCollection = importedData[key] as any // FIXME
          // Arrays (lists, providers, locations, etc.)
          if (Array.isArray(importedCollection) && Array.isArray(newDb[key])) {
            newDb[key] = [...newDb[key]]
            importedCollection.forEach((item: any) => {
              if (item.id) {
                const exists = newDb[key].find((x: any) => x.id === item.id)
                if (!exists) {
                  newDb[key].push(item)
                  if (key === 'departments') stats.departmentsAdded++
                  else stats.otherRecordsAdded++
                }
              }
            })
          }
          // Objects (if other collections are objects)
          else if (typeof importedCollection === 'object' && importedCollection !== null) {
            newDb[key] = { ...newDb[key] }
            Object.keys(importedCollection).forEach(itemId => {
              if (!newDb[key][itemId]) {
                newDb[key][itemId] = importedCollection[itemId]
                if (key === 'departments') stats.departmentsAdded++
                else stats.otherRecordsAdded++
              }
            })
          }
        }
      })
      return newDb as any // FIXME
    })
    window.alert(`Import Complete!\nPatients Added: ${stats.patientsAdded}\nEncounters Added: ${stats.encountersAdded}\nDepartments Added: ${stats.departmentsAdded}\nOther Records Added: ${stats.otherRecordsAdded}`)
  }

  const handleDelete = () => {
    if (window.confirm("Are you SURE you want to delete the entire database? This cannot be undone and will erase EVERYTHING.")) {
      // Reset to empty state matching Database.Root structure
      setDb({
        departments: [],
        patients: {},
        schedules: [],
        lists: [],
        providers: [],
        locations: [],
        orderables: {} as Database.Root['orderables'],
        flowsheets: []
      })
      window.alert("Database has been erased.")
    }
  }

  return (
    <Window
      title={(
        <Stack direction="row" spacing={1} alignItems="center">
          <Icon color="primary">settings_applications</Icon>
          <Label variant="h6">Database Management</Label>
        </Stack>
      ) as any}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      ContentProps={{ sx: { p: 0, overflow: 'hidden' } }}
    >
      <Grid container sx={{ height: '70vh' }}>
        {/* Left Pane: Explorer */}
        <Grid size={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
          <Stack sx={{ flex: 1, overflow: 'hidden' }}>
            <Box p={2}>
              <Label variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon size={18}>account_tree</Icon> Live Data Explorer
              </Label>
              <Label variant="caption" color="textSecondary">
                Inspect the current state of the database in real-time.
              </Label>
            </Box>
            <Divider />
            <TreeView
              aria-label="database explorer"
              defaultExpandedItems={['root']}
              sx={{ flex: 1, overflow: 'auto' }}
            >
              <JSONTreeNode label="Root" value={db} path="root" />
            </TreeView>
          </Stack>
        </Grid>

        {/* Right Pane: Actions */}
        <Grid size={4} sx={{ height: '100%', p: 3, bgcolor: 'grey.50' }}>
          <Stack spacing={4}>
            <Box>
              <Label variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon>download</Icon> Export
              </Label>
              <Label variant="body2" color="textSecondary" paragraph>
                Download the entire database as a JSON file for backup or transfer. This includes all patients, encounters, departments, and configuration.
              </Label>
              <Button variant="contained" onClick={handleExport} startIcon={<Icon>download</Icon>} fullWidth>
                Export to JSON
              </Button>
            </Box>

            <Divider />

            <Box>
              <Label variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon>upload</Icon> Import
              </Label>
              <Label variant="body2" color="textSecondary" paragraph>
                Import a previously exported JSON file. New records will be appended. Existing patients will be updated with new encounters.
              </Label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileChange}
              />
              <Button variant="outlined" onClick={() => fileInputRef.current?.click()} startIcon={<Icon>upload</Icon>} fullWidth>
                Import from JSON
              </Button>
            </Box>

            <Divider />

            <Box sx={{ mt: 'auto' }}>
              <Label variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon>delete_forever</Icon> Delete
              </Label>
              <Label variant="body2" color="textSecondary" paragraph>
                Warning: This action will permanently delete ALL data from the database, including all patients, encounters, and settings. This action cannot be undone.
              </Label>
              <Button variant="contained" color="error" onClick={handleDelete} startIcon={<Icon>delete_forever</Icon>} fullWidth>
                Erase Database
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Window>
  )
}
