import * as React from 'react'
import { usePrompts } from 'components/ui/Core'
import { useDatabase, initialStore, sampleStore } from 'components/contexts/PatientContext'
import * as Database from 'components/contexts/Database'

export interface DatabaseStats {
  patientsAdded: number;
  encountersAdded: number;
  departmentsAdded: number;
  otherRecordsAdded: number;
}

export function extractSinglePatientInfo(datasets: any[]): {
  patientId: Database.Patient.ID;
  patientName: string;
  encounterId: Database.Encounter.ID;
} | null {
  const patientMap = new Map<string, any>()
  for (const rawData of datasets) {
    const items = Array.isArray(rawData) ? rawData : [rawData]
    for (const item of items) {
      if (!item || typeof item !== 'object') continue
      if (item.patients && typeof item.patients === 'object') {
        Object.entries(item.patients).forEach(([pId, p]: [string, any]) => {
          patientMap.set(pId, p)
        })
      } else if (item.mrn) {
        patientMap.set(String(item.mrn), item)
      }
    }
  }

  if (patientMap.size !== 1) {
    return null
  }

  const [patientId, patientObj] = Array.from(patientMap.entries())[0]
  const patientName = patientObj
    ? `${patientObj.lastName || ''}${patientObj.lastName && patientObj.firstName ? ', ' : ''}${patientObj.firstName || ''}`.trim() || `Patient ${patientId}`
    : `Patient ${patientId}`

  const encounterKeys = patientObj?.encounters ? Object.keys(patientObj.encounters) : []
  const encounterId = encounterKeys.length > 0 ? encounterKeys[encounterKeys.length - 1] : '1'

  return {
    patientId: patientId as Database.Patient.ID,
    patientName,
    encounterId: encounterId as Database.Encounter.ID,
  }
}

export function mergeSingleDataset(
  prevDb: any,
  importedData: any,
  stats: DatabaseStats
) {
  const newDb: any = { ...prevDb }
  Object.keys(importedData).forEach((__key) => {
    const key = __key as keyof Database.Root
    if (!newDb[key]) {
      newDb[key] = importedData[key]
      return
    }
    if (key === 'patients') {
      newDb.patients = { ...newDb.patients }
      const importedPatients = importedData.patients || {}
      Object.keys(importedPatients).forEach((__pId) => {
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
            Object.keys(importedEncounters).forEach((__encId) => {
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
      const importedCollection = importedData[key] as any
      // Arrays (lists, providers, locations, appointments, etc.)
      if (Array.isArray(importedCollection) && Array.isArray(newDb[key])) {
        newDb[key] = [...newDb[key]]
        importedCollection.forEach((item: any) => {
          if (!item) return
          const itemId = item.id || (item.patient?.mrn && item.patient?.enc ? `${item.patient.mrn}-${item.patient.enc}` : null)
          if (itemId) {
            const exists = newDb[key].find((x: any) => x && (x.id === itemId || (x.patient?.mrn && x.patient?.enc && `${x.patient.mrn}-${x.patient.enc}` === itemId)))
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
        Object.keys(importedCollection).forEach((itemId) => {
          if (!newDb[key][itemId]) {
            newDb[key][itemId] = importedCollection[itemId]
            if (key === 'departments') stats.departmentsAdded++
            else stats.otherRecordsAdded++
          }
        })
      }
    }
  })
  return newDb
}

export const useDatabaseOperations = () => {
  const [db, setDb] = useDatabase()()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null)
  const [urlImportAnchor, setUrlImportAnchor] = React.useState<HTMLElement | null>(null)
  const [importUrl, setImportUrl] = React.useState('')
  const [isFetchingUrl, setIsFetchingUrl] = React.useState(false)
  const [singlePatientPrompt, setSinglePatientPrompt] = React.useState<{
    patientId: Database.Patient.ID;
    patientName: string;
    encounterId: Database.Encounter.ID;
  } | null>(null)
  const { alert, confirm, prompt } = usePrompts()

  const getDateString = () => {
    try {
      if (typeof Temporal !== 'undefined' && Temporal.Now) {
        return Temporal.Now.plainDateISO().toString()
      }
    } catch {
      // Fallback
    }
    return new Date().toISOString().split('T')[0]
  }

  const selectedEntity = React.useMemo(() => {
    if (!selectedPath) return { type: null }
    const patientMatch = selectedPath.match(/^root\.patients\.([^.]+)$/)
    const encounterMatch = selectedPath.match(/^root\.patients\.([^.]+)\.encounters\.([^.]+)$/)

    if (patientMatch) {
      const pId = patientMatch[1] as Database.Patient.ID
      return {
        type: 'patient' as const,
        patientId: pId,
        patient: db?.patients?.[pId]
      }
    }
    if (encounterMatch) {
      const pId = encounterMatch[1] as Database.Patient.ID
      const eId = encounterMatch[2] as Database.Encounter.ID
      return {
        type: 'encounter' as const,
        patientId: pId,
        encounterId: eId,
        patient: db?.patients?.[pId],
        encounter: db?.patients?.[pId]?.encounters?.[eId]
      }
    }
    return { type: null }
  }, [selectedPath, db])

  const isSelectedExportable = Boolean(
    selectedPath && (
      selectedPath.match(/^root\.patients\.([^.]+)$/) ||
      (selectedPath.match(/^root\.patients\.([^.]+)\.encounters\.([^.]+)$/) && !selectedPath.endsWith('.undefined'))
    )
  )

  const handleExport = () => {
    // Filter out encounters with undefined IDs from all patients
    const cleanedDb = {
      ...db,
      patients: Object.fromEntries(
        Object.entries(db.patients || {}).map(([pId, patient]) => [
          pId,
          {
            ...patient,
            encounters: Object.fromEntries(
              Object.entries(patient.encounters || {}).filter(([eId, enc]) => eId && eId !== 'undefined' && enc.id && (enc.id as any) !== 'undefined')
            )
          }
        ])
      ),
      appointments: (db.appointments || []).filter(a => a.patient?.enc && (a.patient.enc as any) !== 'undefined')
    }

    const url = URL.createObjectURL(new Blob([JSON.stringify(cleanedDb, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `database_export_${getDateString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportSelected = async () => {
    if (!selectedPath) return

    const patientMatch = selectedPath.match(/^root\.patients\.([^.]+)$/)
    const encounterMatch = selectedPath.match(/^root\.patients\.([^.]+)\.encounters\.([^.]+)$/)

    let exportData: Partial<Database.Root> = {}
    let filename = `export_${getDateString()}.json`

    if (patientMatch) {
      const pId = patientMatch[1] as Database.Patient.ID
      const originalPatient = db.patients?.[pId]
      if (!originalPatient) return

      // Filter out encounters with undefined IDs
      const filteredEncounters = Object.fromEntries(
        Object.entries(originalPatient.encounters || {}).filter(([id, enc]) => id && id !== 'undefined' && enc.id && (enc.id as any) !== 'undefined')
      )
      const patient = { ...originalPatient, encounters: filteredEncounters }

      const appointments = (db.appointments || []).filter((a: Database.Appointment) => a.patient.mrn === pId && a.patient.enc && (a.patient.enc as any) !== 'undefined')
      const encounters = Object.values(patient.encounters)
      const careTeamProviders = patient.careTeam?.map(ct => ct.provider) || []

      const providerIds = new Set<Database.Provider.ID>([
        ...encounters.map(e => e.provider),
        ...careTeamProviders
      ])

      const locationIds = new Set<Database.Location.ID>(appointments.map((a: Database.Appointment) => a.location).filter(Boolean) as Database.Location.ID[])

      const departmentIds = new Set<Database.Department.ID>([
        ...encounters.map(e => e.department),
        ...(db.providers || []).filter((p: Database.Provider) => providerIds.has(p.id)).map(p => p.department),
        ...(db.locations || []).filter((l: Database.Location) => locationIds.has(l.id)).map(l => l.departmentId),
        ...appointments.map(a => a.department)
      ])

      exportData = {
        patients: { [pId]: patient },
        providers: (db.providers || []).filter((p: Database.Provider) => providerIds.has(p.id)),
        locations: (db.locations || []).filter((l: Database.Location) => locationIds.has(l.id)),
        departments: (db.departments || []).filter((d: Database.Department) => departmentIds.has(d.id)),
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

      const patient = db.patients?.[pId]
      const encounter = patient?.encounters?.[eId]
      if (!patient || !encounter) return

      const appointments = (db.appointments || []).filter((a: Database.Appointment) => a.patient.enc === eId)

      const providerIds = new Set<Database.Provider.ID>([encounter.provider])
      const locationIds = new Set<Database.Location.ID>(appointments.map((a: Database.Appointment) => a.location).filter(Boolean) as Database.Location.ID[])

      const departmentIds = new Set<Database.Department.ID>([
        encounter.department,
        ...(db.providers || []).filter((p: Database.Provider) => providerIds.has(p.id)).map(p => p.department),
        ...(db.locations || []).filter((l: Database.Location) => locationIds.has(l.id)).map(l => l.departmentId),
        ...appointments.map(a => a.department)
      ])

      exportData = {
        patients: {
          [pId]: {
            ...patient,
            encounters: { [eId]: encounter }
          }
        },
        providers: (db.providers || []).filter((p: Database.Provider) => providerIds.has(p.id)),
        locations: (db.locations || []).filter((l: Database.Location) => locationIds.has(l.id)),
        departments: (db.departments || []).filter((d: Database.Department) => departmentIds.has(d.id)),
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
      const patient = db.patients?.[pId]
      if (!patient) return

      if (await confirm(`Are you SURE you want to delete patient ${patient.lastName}, ${patient.firstName} and all their encounters?`, "Confirm Deletion")) {
        setDb(prev => {
          const newPatients = { ...prev.patients }
          delete newPatients[pId]
          const newAppointments = (prev.appointments || []).filter(a => a.patient.mrn !== pId)
          return { ...prev, patients: newPatients, appointments: newAppointments }
        })
        setSelectedPath(null)
      }
    } else if (encounterMatch) {
      const pId = encounterMatch[1] as Database.Patient.ID
      const eId = encounterMatch[2] as Database.Encounter.ID
      const patient = db.patients?.[pId]
      const encounter = patient?.encounters?.[eId]
      if (!patient || !encounter) return

      if (await confirm(`Are you SURE you want to delete encounter ${eId} from patient ${patient.lastName}?`, "Confirm Deletion")) {
        setDb(prev => {
          const newPatients = { ...prev.patients }
          const newEncounters = { ...newPatients[pId].encounters }
          delete newEncounters[eId]
          newPatients[pId] = { ...newPatients[pId], encounters: newEncounters }
          const newAppointments = (prev.appointments || []).filter(a => a.patient.enc !== eId)
          return { ...prev, patients: newPatients, appointments: newAppointments }
        })
        setSelectedPath(null)
      }
    }
  }

  const handleDeleteEntire = async () => {
    if (await confirm("Are you SURE you want to delete the entire database? This cannot be undone and will erase EVERYTHING.", "Erase Database")) {
      setDb({
        version: initialStore.version,
        departments: initialStore.departments,
        patients: {},
        appointments: [],
        lists: initialStore.lists,
        providers: [],
        locations: initialStore.locations,
        orderables: initialStore.orderables,
        flowsheets: []
      })
      setSelectedPath(null)
      await alert("Database has been erased.", "Database Erased")
    }
  }

  const handleLoadSample = async () => {
    const enteredPassword = await prompt(
      "",
      "",
      "Password Required",
      "password"
    )
    if (enteredPassword === null) return
    if (enteredPassword !== "cimed") {
      await alert("Incorrect password. Access denied.", "Access Denied")
      return
    }

    if (await confirm("Are you SURE you want to reset to the sample database? All your current changes will be LOST.", "Reset to Sample")) {
      setDb(sampleStore as any)
      setSelectedPath(null)
      await alert("Sample database has been loaded.", "Database Reset")
    }
  }

  const mergeMultipleDatabases = (datasets: any[]): DatabaseStats => {
    const stats: DatabaseStats = {
      patientsAdded: 0,
      encountersAdded: 0,
      departmentsAdded: 0,
      otherRecordsAdded: 0
    }

    setDb((prevDb) => {
      let currentDb: any = { ...prevDb }
      for (const rawData of datasets) {
        const items = Array.isArray(rawData) ? rawData : [rawData]
        for (let item of items) {
          if (item && typeof item === 'object') {
            // Support single patient case object directly
            if (item.mrn && !item.patients) {
              item = {
                patients: { [item.mrn]: item },
                departments: item.department ? [{ id: item.department, name: item.department }] : []
              }
            }
            currentDb = mergeSingleDataset(currentDb, item, stats)
          }
        }
      }
      return currentDb
    })

    return stats
  }

  const handleCreateAppointment = ({
    date,
    locationId,
  }: {
    date: string;
    locationId: string;
  }) => {
    if (!singlePatientPrompt?.patientId) return

    const pId = singlePatientPrompt.patientId
    const eId = singlePatientPrompt.encounterId || ('1' as Database.Encounter.ID)

    setDb((prevDb) => {
      const loc = (prevDb.locations || []).find((l) => l.id === locationId)
      const emergencyDept = (prevDb.departments || []).find((d) =>
        d.name?.toLowerCase().includes('emergency')
      )
      const deptId = loc?.departmentId || emergencyDept?.id || ('30' as Database.Department.ID)

      const currentPatients = { ...(prevDb.patients || {}) }
      let currentPatient = currentPatients[pId]
      if (currentPatient) {
        currentPatient = { ...currentPatient }
        const currentEncounters = { ...(currentPatient.encounters || {}) }
        if (!currentEncounters[eId]) {
          currentEncounters[eId] = {
            id: eId,
            date: `${date}T09:00:00Z` as Database.JSONDate,
            department: deptId,
            provider: (prevDb.providers?.[0]?.id || '1') as Database.Provider.ID,
            type: 'ED Visit',
            status: 'Scheduled',
          } as any
          currentPatient.encounters = currentEncounters
          currentPatients[pId] = currentPatient
        }
      }

      const newAppt: Database.Appointment = {
        id: Database.Appointment.ID.create(),
        department: deptId,
        provider: (prevDb.providers?.[0]?.id || '1') as Database.Provider.ID,
        patient: {
          mrn: pId,
          enc: eId,
        },
        type: 'ED Visit',
        location: (locationId || prevDb.locations?.[0]?.id) as Database.Location.ID,
        status: Database.Appointment.Status.Scheduled,
        apptTime: `${date}T09:00:00Z`,
        cc: (currentPatient?.encounters?.[eId]?.concerns || [])
          .filter((c) => typeof c === 'string' && !c.startsWith('!'))
          .join(', '),
        notes: '',
        checkoutTime: null,
      }

      return {
        ...prevDb,
        patients: currentPatients,
        appointments: [...(prevDb.appointments || []), newAppt],
      }
    })

    setSinglePatientPrompt(null)
  }

  const importFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return null

    const datasets: any[] = []
    const errors: string[] = []

    for (const file of fileArray) {
      try {
        const text = await file.text()
        const parsed = JSON.parse(text)
        datasets.push(parsed)
      } catch (err) {
        console.error(`Failed to parse ${file.name}`, err)
        errors.push(`${file.name}: ${err instanceof Error ? err.message : 'Invalid JSON'}`)
      }
    }

    if (datasets.length > 0) {
      const singlePatient = extractSinglePatientInfo(datasets)
      const stats = mergeMultipleDatabases(datasets)
      const fileSummary = fileArray.length === 1
        ? `File "${fileArray[0].name}" imported successfully!`
        : `Imported ${datasets.length} of ${fileArray.length} file(s) successfully!`
      const statsSummary = `\nPatients Added: ${stats.patientsAdded}\nEncounters Added: ${stats.encountersAdded}\nDepartments Added: ${stats.departmentsAdded}\nOther Records Added: ${stats.otherRecordsAdded}`
      const errorSummary = errors.length > 0 ? `\n\nErrors encountered:\n${errors.join('\n')}` : ''

      await alert(fileSummary + statsSummary + errorSummary, "Import Complete")

      if (singlePatient) {
        setSinglePatientPrompt(singlePatient)
      }
      return stats
    } else if (errors.length > 0) {
      await alert(`Failed to import files:\n${errors.join('\n')}`, "Import Error")
      return null
    }
    return null
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    await importFiles(files)
    event.target.value = ''
  }

  const handleImportFromUrl = async () => {
    if (!importUrl) return false
    setIsFetchingUrl(true)
    try {
      const response = await fetch(importUrl)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      const singlePatient = extractSinglePatientInfo([data])
      const stats = mergeMultipleDatabases([data])
      setImportUrl('')
      setUrlImportAnchor(null)
      await alert(`Import Complete!\nPatients Added: ${stats.patientsAdded}\nEncounters Added: ${stats.encountersAdded}\nDepartments Added: ${stats.departmentsAdded}\nOther Records Added: ${stats.otherRecordsAdded}`, "Import Complete")

      if (singlePatient) {
        setSinglePatientPrompt(singlePatient)
      }
      return true
    } catch (error) {
      console.error("Failed to fetch JSON from URL", error)
      await alert(`Failed to import from URL: ${error instanceof Error ? error.message : String(error)}`, "Import Failed")
      return false
    } finally {
      setIsFetchingUrl(false)
    }
  }

  return {
    db,
    setDb,
    selectedPath,
    setSelectedPath,
    selectedEntity,
    isSelectedExportable,
    isFetchingUrl,
    importUrl,
    setImportUrl,
    urlImportAnchor,
    setUrlImportAnchor,
    fileInputRef,
    handleExport,
    handleExportSelected,
    handleDeleteSelected,
    handleDeleteEntire,
    handleLoadSample,
    handleImportFromUrl,
    handleFileChange,
    importFiles,
    mergeMultipleDatabases,
    singlePatientPrompt,
    setSinglePatientPrompt,
    handleCreateAppointment,
  }
}
