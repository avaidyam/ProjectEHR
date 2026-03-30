import * as React from 'react'
import { Window, Button, Stack, Label, Icon, Box, Grid, Divider, TreeView, TreeItem, Popover, Autocomplete, JSONTree, usePrompts } from './Core'
import { useDatabase, initialStore } from '../contexts/PatientContext'
import * as Database from '../contexts/Database'

export const DatabaseManagementWindow = ({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) => {
  const [db, setDb] = useDatabase()()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null)
  const [urlImportAnchor, setUrlImportAnchor] = React.useState<HTMLElement | null>(null)
  const [importUrl, setImportUrl] = React.useState('')
  const [isFetchingUrl, setIsFetchingUrl] = React.useState(false)
  const { alert, confirm } = usePrompts()

  const handleExport = () => {
    // Filter out encounters with undefined IDs from all patients
    const cleanedDb = {
      ...db,
      patients: Object.fromEntries(
        Object.entries(db.patients).map(([pId, patient]) => [
          pId,
          {
            ...patient,
            encounters: Object.fromEntries(
              Object.entries(patient.encounters || {}).filter(([eId, enc]) => eId && eId !== 'undefined' && enc.id && (enc.id as any) !== 'undefined')
            )
          }
        ])
      ),
      appointments: db.appointments.filter(a => a.patient.enc && (a.patient.enc as any) !== 'undefined')
    }

    const url = URL.createObjectURL(new Blob([JSON.stringify(cleanedDb, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `database_export_${Temporal.Now.plainDateISO().toString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportFromUrl = async () => {
    if (!importUrl) return
    setIsFetchingUrl(true)
    try {
      const response = await fetch(importUrl)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      mergeDatabase(data)
      setImportUrl('')
      setUrlImportAnchor(null)
    } catch (error) {
      console.error("Failed to fetch JSON from URL", error)
      await alert(`Failed to import from URL: ${error instanceof Error ? error.message : String(error)}`, "Import Failed")
    } finally {
      setIsFetchingUrl(false)
    }
  }

  const handleExportSelected = async () => {
    if (!selectedPath) return

    const patientMatch = selectedPath.match(/^root\.patients\.([^.]+)$/)
    const encounterMatch = selectedPath.match(/^root\.patients\.([^.]+)\.encounters\.([^.]+)$/)

    let exportData: Partial<Database.Root> = {}
    let filename = `export_${Temporal.Now.plainDateISO().toString()}.json`

    if (patientMatch) {
      const pId = patientMatch[1] as Database.Patient.ID
      const originalPatient = db.patients[pId]
      if (!originalPatient) return

      // Filter out encounters with undefined IDs
      const filteredEncounters = Object.fromEntries(
        Object.entries(originalPatient.encounters || {}).filter(([id, enc]) => id && id !== 'undefined' && enc.id && (enc.id as any) !== 'undefined')
      )
      const patient = { ...originalPatient, encounters: filteredEncounters }

      const appointments = db.appointments.filter((a: Database.Appointment) => a.patient.mrn === pId && a.patient.enc && (a.patient.enc as any) !== 'undefined')
      const encounters = Object.values(patient.encounters)
      const careTeamProviders = patient.careTeam?.map(ct => ct.provider) || []

      const providerIds = new Set<Database.Provider.ID>([
        ...encounters.map(e => e.provider),
        ...careTeamProviders
      ])

      const locationIds = new Set<Database.Location.ID>(appointments.map((a: Database.Appointment) => a.location).filter(Boolean) as Database.Location.ID[])

      const departmentIds = new Set<Database.Department.ID>([
        ...encounters.map(e => e.department),
        ...db.providers.filter((p: Database.Provider) => providerIds.has(p.id)).map(p => p.department),
        ...db.locations.filter((l: Database.Location) => locationIds.has(l.id)).map(l => l.departmentId),
        ...appointments.map(a => a.department)
      ])

      exportData = {
        patients: { [pId]: patient },
        providers: db.providers.filter((p: Database.Provider) => providerIds.has(p.id)),
        locations: db.locations.filter((l: Database.Location) => locationIds.has(l.id)),
        departments: db.departments.filter((d: Database.Department) => departmentIds.has(d.id)),
        appointments: appointments
      }
      filename = `patient_${patient.lastName}_${pId}_export.json`
    } else if (encounterMatch) {
      const pId = encounterMatch[1] as Database.Patient.ID
      const eId = encounterMatch[2] as Database.Encounter.ID

      if (eId === 'undefined') {
        await alert("Cannot export an encounter with an undefined ID.", "Export Error")
        return
      }

      const patient = db.patients[pId]
      const encounter = patient?.encounters[eId]
      if (!patient || !encounter) return

      const appointments = db.appointments.filter((a: Database.Appointment) => a.patient.enc === eId)

      const providerIds = new Set<Database.Provider.ID>([encounter.provider])
      const locationIds = new Set<Database.Location.ID>(appointments.map((a: Database.Appointment) => a.location).filter(Boolean) as Database.Location.ID[])

      const departmentIds = new Set<Database.Department.ID>([
        encounter.department,
        ...db.providers.filter((p: Database.Provider) => providerIds.has(p.id)).map(p => p.department),
        ...db.locations.filter((l: Database.Location) => locationIds.has(l.id)).map(l => l.departmentId),
        ...appointments.map(a => a.department)
      ])

      exportData = {
        patients: {
          [pId]: {
            ...patient,
            encounters: { [eId]: encounter }
          }
        },
        providers: db.providers.filter((p: Database.Provider) => providerIds.has(p.id)),
        locations: db.locations.filter((l: Database.Location) => locationIds.has(l.id)),
        departments: db.departments.filter((d: Database.Department) => departmentIds.has(d.id)),
        appointments: appointments
      }
      filename = `encounter_${eId}_export.json`
    } else {
      await alert("Please select a Patient or an Encounter from the tree to export individually.", "Export Selection Required")
      return
    }

    const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeleteSelected = async () => {
    if (!selectedPath) return

    const patientMatch = selectedPath.match(/^root\.patients\.([^.]+)$/)
    const encounterMatch = selectedPath.match(/^root\.patients\.([^.]+)\.encounters\.([^.]+)$/)

    if (patientMatch) {
      const pId = patientMatch[1] as Database.Patient.ID
      const patient = db.patients[pId]
      if (!patient) return

      if (await confirm(`Are you SURE you want to delete patient ${patient.lastName}, ${patient.firstName} and all their encounters?`, "Confirm Deletion")) {
        setDb(prev => {
          const newPatients = { ...prev.patients }
          delete newPatients[pId]
          const newAppointments = prev.appointments.filter(a => a.patient.mrn !== pId);
          return { ...prev, patients: newPatients, appointments: newAppointments }
        })
        setSelectedPath(null)
      }
    } else if (encounterMatch) {
      const pId = encounterMatch[1] as Database.Patient.ID
      const eId = encounterMatch[2] as Database.Encounter.ID
      const patient = db.patients[pId]
      const encounter = patient?.encounters[eId]
      if (!patient || !encounter) return

      if (await confirm(`Are you SURE you want to delete encounter ${eId} from patient ${patient.lastName}?`, "Confirm Deletion")) {
        setDb(prev => {
          const newPatients = { ...prev.patients }
          const newEncounters = { ...newPatients[pId].encounters }
          delete newEncounters[eId]
          newPatients[pId] = { ...newPatients[pId], encounters: newEncounters }
          const newAppointments = prev.appointments.filter(a => a.patient.enc !== eId);
          return { ...prev, patients: newPatients, appointments: newAppointments }
        })
        setSelectedPath(null)
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        mergeDatabase(JSON.parse(e.target!.result as string))
      } catch (error) {
        console.error("Failed to parse JSON", error)
        await alert("Failed to parse the selected JSON file.", "Import Error")
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
    alert(`Import Complete!\nPatients Added: ${stats.patientsAdded}\nEncounters Added: ${stats.encountersAdded}\nDepartments Added: ${stats.departmentsAdded}\nOther Records Added: ${stats.otherRecordsAdded}`, "Import Complete")
  }

  const handleDelete = async () => {
    if (await confirm("Are you SURE you want to delete the entire database? This cannot be undone and will erase EVERYTHING.", "Erase Database")) {
      // Reset to empty state matching Database.Root structure
      setDb({
        version: initialStore.version,
        departments: [],
        patients: {},
        appointments: [],
        lists: [],
        providers: [],
        locations: [],
        orderables: {} as Database.Root['orderables'],
        flowsheets: []
      })
      await alert("Database has been erased.", "Database Erased")
    }
  }

  const handleLoadSample = async () => {
    if (await confirm("Are you SURE you want to reset to the sample database? All your current changes will be LOST.", "Reset to Sample")) {
      setDb(initialStore as any)
      await alert("Sample database has been loaded.", "Database Reset")
    }
  }

  const isSelectedExportable = selectedPath && (selectedPath.match(/^root\.patients\.([^.]+)$/) || (selectedPath.match(/^root\.patients\.([^.]+)\.encounters\.([^.]+)$/) && !selectedPath.endsWith('.undefined')))

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
                Select a Patient or Encounter to export individually with all linked records.
              </Label>
            </Box>
            <Divider />
            <JSONTree
              aria-label="database explorer"
              data={db}
              label="Root"
              path="root"
              selectedItems={selectedPath}
              onSelectedItemsChange={(_, id) => setSelectedPath(id as string)}
              sx={{ flex: 1, overflow: 'auto' }}
            />
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
                Download data from the database. Linked records (departments, providers, etc.) are included automatically.
              </Label>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleExportSelected}
                  disabled={!isSelectedExportable}
                  startIcon={<Icon>person_search</Icon>}
                  fullWidth
                >
                  Export Selected
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleExport}
                  startIcon={<Icon>database</Icon>}
                  fullWidth
                >
                  Export Entire Database
                </Button>
              </Stack>
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
              <Stack spacing={2}>
                <Button variant="outlined" onClick={() => fileInputRef.current?.click()} startIcon={<Icon>upload</Icon>} fullWidth>
                  Import from JSON
                </Button>
                <Button
                  variant="outlined"
                  onClick={(e) => setUrlImportAnchor(e.currentTarget)}
                  startIcon={<Icon>link</Icon>}
                  fullWidth
                >
                  Import from URL
                </Button>
              </Stack>
              <Popover
                open={Boolean(urlImportAnchor)}
                anchorEl={urlImportAnchor}
                onClose={() => setUrlImportAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{ paper: { sx: { p: 2, width: 300 } } }}
              >
                <Stack spacing={2}>
                  <Label variant="subtitle2">Import Database from URL</Label>
                  <Autocomplete
                    freeSolo
                    options={[]}
                    fullWidth
                    size="small"
                    placeholder="https://example.com/database.json"
                    value={importUrl}
                    onInputChange={(_, val) => setImportUrl(val)}
                    disabled={isFetchingUrl}
                  />
                  <Button
                    variant="contained"
                    onClick={handleImportFromUrl}
                    disabled={!importUrl || isFetchingUrl}
                    fullWidth
                  >
                    {isFetchingUrl ? 'Importing...' : 'Import'}
                  </Button>
                </Stack>
              </Popover>
            </Box>

            <Divider />

            <Box sx={{ mt: 'auto' }}>
              <Label variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon>delete_forever</Icon> Delete
              </Label>
              <Label variant="body2" color="textSecondary" paragraph>
                Warning: These actions are permanent and cannot be undone.
              </Label>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelected}
                  disabled={!isSelectedExportable}
                  startIcon={<Icon>person_remove</Icon>}
                  fullWidth
                >
                  Delete Selected
                </Button>
                <Button variant="outlined" color="primary" onClick={handleLoadSample} startIcon={<Icon>restore</Icon>} fullWidth>
                  Load Sample Database
                </Button>
                <Button variant="outlined" color="error" onClick={handleDelete} startIcon={<Icon>delete_forever</Icon>} fullWidth>
                  Erase Entire Database
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Window>
  )
}
