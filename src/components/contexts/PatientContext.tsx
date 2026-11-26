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
    if (typeof indexedDB === 'undefined') return null;
    return new Promise<IDBDatabase | null>((res, rej) => {
      const req = indexedDB.open('ProjectEHR', 1);
      req.onupgradeneeded = () => req.result.objectStoreNames.contains('store') || req.result.createObjectStore('store');
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },
  async save(data: any, initialVersion?: number) {
    const db = await this.db();
    if (!db) return;
    const tx = db.transaction('store', 'readwrite');
    tx.objectStore('store').put(JSON.parse(JSON.stringify(data)), this.key);
    if (initialVersion !== undefined)
      tx.objectStore('store').put(initialVersion, `${this.key}:version`);
    console.debug('[Storage] Checkpoint saved.');
  },
  async loadVersion(): Promise<number | null> {
    const db = await this.db();
    if (!db || !db.objectStoreNames.contains('store')) return null;
    return new Promise<number | null>(res => {
      const req = db.transaction('store', 'readonly').objectStore('store').get(`${this.key}:version`);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror = () => res(null);
    });
  },
  async load() {
    const db = await this.db();
    if (!db || !db.objectStoreNames.contains('store')) return null;
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

const BASELINE_DEPARTMENT_IDS = new Set(['26', '30', '31']);

const ADULT_MEDICINE_LOCATION: Database.Location = {
  id: '26000000-0000-4000-8000-000000000001' as Database.Location.ID,
  name: 'ADULT MEDICINE PWAM PBB Room 1',
  type: 'Clinic',
  departmentId: '26' as Database.Department.ID,
  status: 'Available',
};

const rawSample = patient_sample as unknown as Database.Root;
const baselineDepartments = rawSample.departments.filter((d) => BASELINE_DEPARTMENT_IDS.has(d.id));
const baselineLocations: Database.Location[] = [
  ...(rawSample.locations || []),
  ...((rawSample.locations || []).some((l) => l.departmentId === '26') ? [] : [ADULT_MEDICINE_LOCATION]),
];
const baselineLists = (rawSample.lists || [])
  .filter((l) => l.id === 'all-patients')
  .map((l) => ({
    ...l,
    columns: (l.columns || []).filter((c) => c.id !== 'status'),
  }));

// Sample database (loaded on demand behind password)
export const sampleStore: Database.Root = {
  departments: rawSample.departments,
  patients: rawSample.patients,
  appointments: rawSample.appointments,
  lists: rawSample.lists,
  providers: rawSample.providers,
  locations: baselineLocations,
  orderables: orderables,
  flowsheets: rawSample.flowsheets
}

// Default empty store (no patient data loaded on first visit; includes baseline locations, departments, & All Patients list)
export const initialStore: Database.Root = {
  departments: baselineDepartments,
  patients: {},
  appointments: [],
  lists: baselineLists,
  providers: [],
  locations: baselineLocations,
  orderables: orderables,
  flowsheets: []
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

  // Compare the persisted initial-seed version against the current seed version.
  // This means user-added patients/encounters never trigger a spurious reset —
  // only a change in the bundled sample data (schema change) causes a reset.
  // On first run, persist the initial version alongside the seed data.
  React.useEffect(() => {
    Promise.all([STORAGE.load(), STORAGE.loadVersion()]).then(([data, persistedVersion]) => {
      const initialVersion = computeVersion(initialStore);
      if (data) {
        if (persistedVersion !== initialVersion) {
          console.warn(`[Storage] Version mismatch: persisted=${persistedVersion}, initial=${initialVersion}. Resetting database.`);
          STORAGE.save(initialStore, initialVersion);
          // initialStore is already being used as the default value in createStore
        } else {
          // Ensure essential baseline catalogs (orderables, departments, locations) are preserved if empty in storage
          if (!data.orderables || !data.orderables.components || !data.orderables.procedures) {
            data.orderables = { ...initialStore.orderables, ...(data.orderables || {}) };
          }
          if (!data.departments || data.departments.length === 0) {
            data.departments = [...initialStore.departments];
          }
          if (!data.locations || data.locations.length === 0) {
            data.locations = [...initialStore.locations];
          }
          if (!data.lists || data.lists.length === 0) {
            data.lists = [...initialStore.lists];
          } else if (!data.lists.some((l) => l.id === 'all-patients') && initialStore.lists.length > 0) {
            data.lists = [...data.lists, ...initialStore.lists];
          }
          isRestoring = true;
          setGlobalStore(data as any);
          isRestoring = false;
          console.log(`[Storage] Database version=${persistedVersion} initialized from disk.`);
        }
      } else {
        STORAGE.save(initialStore, initialVersion);
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
    useChart: () => {
      //if (!patient) throw new Error("No patient ID provided to useChart hook.");
      return useStore1.patients[patient as any]
    },
    useEncounter: () => {
      //if (!patient || !encounter) throw new Error("No patient or encounter ID provided to useEncounter hook.");
      return useStore1.patients[patient as any].encounters[encounter as any]
    }
  }), [patient, encounter])

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