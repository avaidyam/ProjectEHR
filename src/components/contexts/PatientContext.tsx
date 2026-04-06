import * as React from 'react'
import { useNavigate, generatePath, useParams } from 'react-router-dom';
import createStore from "teaful";

import * as Database from './Database'
export * as Database from './Database'

// 
import patient_sample from 'util/data/patient_sample.json'
import orderables from 'util/data/orderables.json'

//
// Persistence Engine
//
const STORAGE = {
  key: 'ehr-database',
  async db() {
    return new Promise<IDBDatabase>((res, rej) => {
      const req = indexedDB.open('ProjectEHR', 1);
      req.onupgradeneeded = () => req.result.objectStoreNames.contains('store') || req.result.createObjectStore('store');
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },
  async save(data: any) {
    const db = await this.db();
    db.transaction('store', 'readwrite').objectStore('store').put(JSON.parse(JSON.stringify(data)), this.key);
    console.debug('[Storage] Checkpoint saved.');
  },
  async load() {
    const db = await this.db();
    if (!db.objectStoreNames.contains('store')) return null;
    return new Promise<Database.Root | null>(res => {
      const req = db.transaction('store', 'readonly').objectStore('store').get(this.key);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });
  }
};

// 
// 
// 
// Contexts moved below types for proper initialization
//

// Calculate a version number from the database based on number of items
const computeVersion = (data: Database.Root): number =>
  (data.departments?.length ?? 0) +
  Object.keys(data.patients ?? {}).length +
  Object.values(data.patients ?? {}).reduce((sum, p) => sum + Object.keys(p.encounters ?? {}).length, 0) +
  (data.appointments?.length ?? 0) +
  (data.lists?.length ?? 0) +
  (data.providers?.length ?? 0) +
  (data.locations?.length ?? 0);

// 
export const initialStore: Database.Root = {
  departments: (patient_sample as unknown as Database.Root).departments,
  patients: (patient_sample as unknown as Database.Root).patients,
  appointments: (patient_sample as unknown as Database.Root).appointments,
  lists: (patient_sample as unknown as Database.Root).lists,
  providers: (patient_sample as unknown as Database.Root).providers,
  locations: (patient_sample as unknown as Database.Root).locations,
  orderables: orderables,
  flowsheets: (patient_sample as unknown as Database.Root).flowsheets
}

let isRestoring = false
let saveTimeout: any
const { useStore, setStore: setGlobalStore } = createStore(initialStore, ({ store, prevStore }) => {
  if (isRestoring) return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => STORAGE.save(store), 1000);
})

export type DatabaseContextValue = typeof useStore;
export interface PatientContextValue {
  isChartReview: boolean;
  useChart: () => DatabaseContextValue['patients'][Database.Patient.ID];
  useEncounter: () => DatabaseContextValue['patients'][Database.Patient.ID]['encounters'][Database.Encounter.ID];
}

export const DatabaseContext = React.createContext<DatabaseContextValue | undefined>(undefined);
export const PatientContext = React.createContext<PatientContextValue | undefined>(undefined);

// Usage: `<DatabaseProvider>{...}</DatabaseProvider>`
export const DatabaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isReady, setIsReady] = React.useState(false);
  React.useEffect(() => {
    STORAGE.load().then(data => {
      if (data) {
        // If the computed version of the stored data differs from the initial store's
        // computed version, a schema change has occurred — reset to avoid data corruption.
        const storedVersion = computeVersion(data);
        const initialVersion = computeVersion(initialStore);
        if (storedVersion !== initialVersion) {
          console.warn(`[Storage] Version mismatch: stored=${storedVersion}, initial=${initialVersion}. Resetting database.`);
          STORAGE.save(initialStore);
          // initialStore is already being used as the default value in createStore
        } else {
          isRestoring = true;
          setGlobalStore(data as any);
          isRestoring = false;
          console.log(`[Storage] Database version=${storedVersion} initialized from disk.`);
        }
      }
      setIsReady(true);
    });
  }, []);

  return isReady ? (
    <DatabaseContext.Provider value={useStore}>
      {children}
    </DatabaseContext.Provider>
  ) : null;
}

// FIXME: PatientProvider.updateData does not actually persist outside of the Provider's context! 
// We need to actually React.useEffect() to set the "database" value to the new patient data.
// Usage: `<PatientProvider patient={123} encounter={123}>{...}</PatientProvider>`
export const PatientProvider: React.FC<{
  patient: Database.Patient.ID | null | undefined;
  encounter: Database.Encounter.ID | null | undefined;
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
  const value: PatientContextValue = React.useMemo(() => ({
    isChartReview: !encounter,
    useChart: () => {
      //if (!patient) throw new Error("No patient ID provided to useChart hook.");
      return useStore1.patients[patient as any]
    },
    useEncounter: () => {
      //if (!patient || !encounter) throw new Error("No patient or encounter ID provided to useEncounter hook.");
      return useStore1.patients[patient as any].encounters[encounter as any]
    }
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
export const usePatientMRN = (): [Database.Patient.ID, (value: string) => void] => {
  const { mrn } = useParams() as { mrn: string }
  const navigate = useNavigate()
  return [
    mrn as Database.Patient.ID,
    (value: string) => navigate(generatePath('/patient/:mrn', { mrn: value })),
  ]
}

/**
 * hook to extract mrn from url and set new one
 * *must* be used from within a functional component
 * Usage: `const [encounterID, setEncounterID] = useEncounterID()`
 */
export const useEncounterID = (): [Database.Encounter.ID, (value: string) => void] => {
  const { mrn, enc } = useParams() as { mrn: string; enc: string }
  const navigate = useNavigate()
  return [
    enc as Database.Encounter.ID,
    (value: string) => navigate(generatePath('/patient/:mrn/encounter/:enc', { mrn: mrn ?? null, enc: value })),
  ]
}