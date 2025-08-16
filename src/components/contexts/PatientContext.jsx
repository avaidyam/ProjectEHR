import * as React from 'react'
import { useNavigate, generatePath, useParams } from 'react-router-dom';
import createStore from "teaful";
import { TEST_PATIENT_INFO } from 'util/data/PatientSample.js';

export const PatientContext = React.createContext()

// FIXME: PatientProvider.updateData does not actually persist outside of the Provider's context! 
// We need to actually useEffect() to set the "database" value to the new patient data.

// Usage: `<PatientProvider patient={123} encounter={123}>{...}</PatientProvider>`
export const PatientProvider = ({ patient, encounter, children }) => {
  // const { useStore } = createStore(TEST_PATIENT_INFO({ patientMRN: patient }))
  const [data, setData] = React.useState(TEST_PATIENT_INFO({ patientMRN: patient }))
  const value = React.useMemo(() => ({ patient, encounter, data, updateData: setData }), [patient, encounter, data])
  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}

// Usage: `const { patient, encounter, data, updateData } = usePatient()`
// Usage: `updateData(prev => ...)`
export const usePatient = () => {
  const ctx = React.useContext(PatientContext)
  if (ctx === undefined) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return ctx
}

/**
 * hook to extract mrn from url and set new one
 * *must* be used from within a functional component INSIDE a <Route>! (i.e. This will NOT work from Titlebar if it is not rendered within a route.)
 * Usage: `const [patientMRN, setPatientMRN] = usePatientMRN()`
 */
export const usePatientMRN = () => {
  const { mrn } = useParams()
  const navigate = useNavigate()
  return [
    mrn,
    (value) => navigate(generatePath('/patient/:mrn', { mrn: value })),
  ]
}

/**
 * hook to extract mrn from url and set new one
 * *must* be used from within a functional component
 * Usage: `const [encounterID, setEncounterID] = useEncounterID()`
 */
export const useEncounterID = () => {
  const { mrn, enc } = useParams()
  const navigate = useNavigate()
  return [
    enc,
    (value) => navigate(generatePath('/patient/:mrn/encounter/:enc', { mrn, enc: value })),
  ]
}
