// import * as React from 'react'
// import { useNavigate, generatePath, useParams } from 'react-router-dom';
// import createStore from "teaful";
// import patient_sample from 'util/data/patient_sample.json'

// export const PatientContext = React.createContext()

// // FIXME: PatientProvider.updateData does not actually persist outside of the Provider's context! 
// // We need to actually useEffect() to set the "database" value to the new patient data.

// // Usage: `<PatientProvider patient={123} encounter={123}>{...}</PatientProvider>`
// export const PatientProvider = ({ patient, encounter, children }) => {

//   // 
//   const initialStore = patient_sample[patient]
//   const { useStore } = createStore(initialStore, ({ store, prevStore }) => {
//     // TODO: ...
//   })
//   // const [data, setData] = useStore() // React.useState(patient_sample[patient])
  
//   // Memoize the hook value by patient and encounter IDs so it doesn't change on every single render!
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const value = React.useMemo(() => ({ useChart: () => useStore, useEncounter: () => useStore.encounters[encounter] }), [patient, encounter])
  
//   return (
//     <PatientContext.Provider value={value}>
//       {children}
//     </PatientContext.Provider>
//   )
// }

// /** 
//   Usage:
//   ```
//   const { useChart, useEncounter } = usePatient()
//   const [chart, setChart] = useChart()()
//   const [encounter, setEncounter] = useEncounter()()
//   ```

//   Usage: 
//   ```
//   const [medicalHx, setMedicalHx] = useEncounter().history.medical()
//   setMedicalHx(prev => [...prev, { new item here }])
//   ```
//  */
// export const usePatient = () => {
//   const ctx = React.useContext(PatientContext)
//   if (ctx === undefined) {
//     throw new Error('usePatient must be used within a PatientProvider')
//   }
//   return ctx
// }

// /**
//  hook to extract mrn from url and set new one

//  *must* be used from within a functional component INSIDE a <Route>! (i.e. This will NOT work from Titlebar if it is not rendered within a route.)

//  Usage: `const [patientMRN, setPatientMRN] = usePatientMRN()`
//  */
// export const usePatientMRN = () => {
//   const { mrn } = useParams()
//   const navigate = useNavigate()
//   return [
//     mrn,
//     (value) => navigate(generatePath('/patient/:mrn', { mrn: value })),
//   ]
// }

// /**
//  * hook to extract mrn from url and set new one
//  * *must* be used from within a functional component
//  * Usage: `const [encounterID, setEncounterID] = useEncounterID()`
//  */
// export const useEncounterID = () => {
//   const { mrn, enc } = useParams()
//   const navigate = useNavigate()
//   return [
//     enc,
//     (value) => navigate(generatePath('/patient/:mrn/encounter/:enc', { mrn, enc: value })),
//   ]
// }

import * as React from 'react';
import { useNavigate, generatePath, useParams } from 'react-router-dom';
import createStore from 'teaful';
import patient_sample from 'util/data/patient_sample.json';

export const PatientContext = React.createContext();

// Usage: `<PatientProvider patient={123} encounter={123}>{...}</PatientProvider>`
export const PatientProvider = ({ patient, encounter, children }) => {
  // Load saved data from localStorage if it exists
  const savedData = localStorage.getItem(`patient_${patient}`);
  const parsedData = savedData ? JSON.parse(savedData) : patient_sample[patient];

  // Initialize teaful store with saved or sample data
  const { useStore } = createStore(parsedData, ({ store }) => {
    // Whenever store changes, update localStorage
    localStorage.setItem(`patient_${patient}`, JSON.stringify(store));
  });

  // Memoize value so it's stable between renders
  const value = React.useMemo(
    () => ({
      useChart: () => useStore,
      useEncounter: () => useStore.encounters[encounter],
    }),
    [patient, encounter]
  );

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const ctx = React.useContext(PatientContext);
  if (ctx === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return ctx;
};

export const usePatientMRN = () => {
  const { mrn } = useParams();
  const navigate = useNavigate();
  return [
    mrn,
    (value) => navigate(generatePath('/patient/:mrn', { mrn: value })),
  ];
};

export const useEncounterID = () => {
  const { mrn, enc } = useParams();
  const navigate = useNavigate();
  return [
    enc,
    (value) =>
      navigate(generatePath('/patient/:mrn/encounter/:enc', {
        mrn,
        enc: value,
      })),
  ];
};
