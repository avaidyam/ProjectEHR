import React, { useRef, useState } from 'react'
import { Window, Button, Stack, Label, Icon, Box } from './Core'
import { useDatabase } from '../contexts/PatientContext'
import * as Database from '../contexts/Database'

interface DatabaseManagementWindowProps {
  open: boolean;
  onClose: () => void;
}

interface ImportStats {
  patientsAdded: number;
  encountersAdded: number;
  departmentsAdded: number;
  otherRecordsAdded: number;
}

export const DatabaseManagementWindow: React.FC<DatabaseManagementWindowProps> = ({ open, onClose }) => {
  // Returns useStore hook, which returns [store, setStore]
  const useStore = useDatabase();
  const [db, setDb] = useStore() as [Database.Root, any]; // Type the store, and setter
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `database_export_${new Date().toISOString().slice(0, 10)}.json`
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
        const importedData = JSON.parse(e.target?.result as string)
        mergeDatabase(importedData)
      } catch (error) {
        console.error("Failed to parse JSON", error)
        window.alert("Failed to parse the selected JSON file.")
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const mergeDatabase = (importedData: any) => {
    let stats: ImportStats = {
      patientsAdded: 0,
      encountersAdded: 0,
      departmentsAdded: 0,
      otherRecordsAdded: 0
    }

    setDb((prevDb: Database.Root) => {
      const newDb: any = { ...prevDb } // Use any for dynamic access, or type strictly if possible
      Object.keys(importedData).forEach(key => {
        const k = key as keyof Database.Root; // Cast key

        if (!newDb[key]) {
          newDb[key] = importedData[key]
          return
        }
        if (key === 'patients') {
          newDb.patients = { ...newDb.patients }
          const importedPatients = importedData.patients
          Object.keys(importedPatients).forEach(pId => {
            if (!newDb.patients[pId]) {
              newDb.patients[pId] = importedPatients[pId]
              stats.patientsAdded++
            } else {
              const importedEncounters = importedPatients[pId].encounters
              if (importedEncounters) {
                newDb.patients[pId] = { ...newDb.patients[pId] }
                const currentEncounters = newDb.patients[pId].encounters || {}
                newDb.patients[pId].encounters = { ...currentEncounters }
                Object.keys(importedEncounters).forEach(encId => {
                  if (!newDb.patients[pId].encounters[encId]) {
                    newDb.patients[pId].encounters[encId] = importedEncounters[encId]
                    stats.encountersAdded++
                  }
                })
              }
            }
          })
        } else {
          const importedCollection = importedData[key]
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
          // Objects (if any other collections are objects?) - currently most top levels are arrays except patients, settings?
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
      return newDb
    })
    window.alert(`Import Complete!\nPatients Added: ${stats.patientsAdded}\nEncounters Added: ${stats.encountersAdded}\nDepartments Added: ${stats.departmentsAdded}\nOther Records Added: ${stats.otherRecordsAdded}`)
  }

  const handleDelete = () => {
    if (window.confirm("Are you SURE you want to delete the entire database? This cannot be undone and will erase EVERYTHING.")) {
      // Reset to empty state matching Database.Root structure
      const emptyRoot: Database.Root = {
        departments: [],
        patients: {},
        schedules: [],
        lists: [],
        providers: [],
        locations: [],
        orderables: [],
        flowsheets: []
      };
      setDb(emptyRoot)
      window.alert("Database has been erased.")
    }
  }

  return (
    <Window
      title="Database Management"
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Stack spacing={3} sx={{ p: 2 }}>
        <Box>
          <Label variant="h6" gutterBottom>Export Database</Label>
          <Label variant="body2" color="textSecondary" paragraph>
            Download the entire database as a JSON file. This includes all patients, encounters, departments, and configuration.
          </Label>
          <Button variant="contained" onClick={handleExport} startIcon={<Icon>download</Icon>}>
            Export to JSON
          </Button>
        </Box>
        <Box>
          <Label variant="h6" gutterBottom>Import Database</Label>
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
          <Button variant="outlined" onClick={() => fileInputRef.current?.click()} startIcon={<Icon>upload</Icon>}>
            Import from JSON
          </Button>
        </Box>
        <Box>
          <Label variant="h6" gutterBottom color="error">Delete Database</Label>
          <Label variant="body2" color="textSecondary" paragraph>
            Warning: This action will permanently delete ALL data from the database, including all patients, encounters, and settings. This action cannot be undone.
          </Label>
          <Button variant="contained" color="error" onClick={handleDelete} startIcon={<Icon>delete_forever</Icon>}>
            Erase Database
          </Button>
        </Box>
      </Stack>
    </Window>
  )
}
