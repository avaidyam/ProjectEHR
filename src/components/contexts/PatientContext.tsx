import * as React from 'react'
import { useNavigate, generatePath, useParams } from 'react-router-dom';
import createStore from "teaful";
import * as Database from './Database'

// 
import patient_sample from 'util/data/patient_sample.json'
import orderables from 'util/data/orderables.json'

// 
export type DatabaseContextValue = ReturnType<typeof createStore<Database.Root>>['useStore'];
export interface PatientContextValue {
  useChart: () => DatabaseContextValue['patients'][string];
  useEncounter: () => DatabaseContextValue['patients'][string]['encounters'][string];
}

export const DatabaseContext = React.createContext<DatabaseContextValue | undefined>(undefined)
export const PatientContext = React.createContext<PatientContextValue | undefined>(undefined)

// 
const initialStore: Database.Root = {
  departments: (patient_sample as unknown as Database.Root).departments,
  patients: (patient_sample as unknown as Database.Root).patients,
  schedules: (patient_sample as unknown as Database.Root).schedules,
  lists: (patient_sample as unknown as Database.Root).lists,
  providers: (patient_sample as unknown as Database.Root).providers,
  locations: (patient_sample as unknown as Database.Root).locations,
  orderables: orderables,
  flowsheets: (patient_sample as unknown as Database.Root).flowsheets
}
const { useStore } = createStore(initialStore, ({ store, prevStore }) => {
  // TODO: ...
})

// Usage: `<DatabaseProvider>{...}</DatabaseProvider>`
export const DatabaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <DatabaseContext.Provider value={useStore}>
      {children}
    </DatabaseContext.Provider>
  )
}

// FIXME: PatientProvider.updateData does not actually persist outside of the Provider's context! 
// We need to actually useEffect() to set the "database" value to the new patient data.
// Usage: `<PatientProvider patient={123} encounter={123}>{...}</PatientProvider>`
export const PatientProvider: React.FC<{
  patient: string;
  encounter: string;
  children: React.ReactNode;
}> = ({ patient, encounter, children }) => {
  const useStore1 = useDatabase()
  /*const [initialStore, setStore] = useDatabase().patients[patient]()

  // 
  //const initialStore = patient_sample.patients[patient]
  const { useStore } = createStore(initialStore, ({ store, prevStore }) => {
    // TODO: ...
  })*/
  // const [data, setData] = useStore() // React.useState(patient_sample.patients[patient])

  // Memoize the hook value by patient and encounter IDs so it doesn't change on every single render!
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = React.useMemo(() => ({
    useChart: () => useStore1.patients[patient],
    useEncounter: () => useStore1.patients[patient].encounters[encounter]
  }), [patient, encounter, useStore1.patients])

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}

/** 
  Usage:
  ```
  const { orders, patients, ... } = useDatabase()()
  ```
 */
export const useDatabase = () => {
  const ctx = React.useContext(DatabaseContext)
  if (ctx === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return ctx
}

/** 
  Usage:
  ```
  const { useChart, useEncounter } = usePatient()
  const [chart, setChart] = useChart()()
  const [encounter, setEncounter] = useEncounter()()
  ```

  Usage: 
  ```
  const [medicalHx, setMedicalHx] = useEncounter().history.medical()
  setMedicalHx(prev => [...prev, { new item here }])
  ```
 */
export const usePatient = () => {
  const ctx = React.useContext(PatientContext)
  if (ctx === undefined) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return ctx
}

/**
  hook to extract mrn from url and set new one

 *must* be used from within a functional component INSIDE a <Route>! (i.e. This will NOT work from Titlebar if it is not rendered within a route.)

 Usage: `const [patientMRN, setPatientMRN] = usePatientMRN()`
 */
export const usePatientMRN = (): [string | undefined, (value: string) => void] => {
  const { mrn } = useParams<{ mrn: string }>()
  const navigate = useNavigate()
  return [
    mrn,
    (value: string) => navigate(generatePath('/patient/:mrn', { mrn: value })),
  ]
}

/**
 * hook to extract mrn from url and set new one
 * *must* be used from within a functional component
 * Usage: `const [encounterID, setEncounterID] = useEncounterID()`
 */
export const useEncounterID = (): [string | undefined, (value: string) => void] => {
  const { mrn, enc } = useParams<{ mrn: string; enc: string }>()
  const navigate = useNavigate()
  return [
    enc,
    (value: string) => navigate(generatePath('/patient/:mrn/encounter/:enc', { mrn: mrn ?? null, enc: value })),
  ]
}