import * as React from 'react'
import { useNavigate, generatePath, useParams } from 'react-router-dom';
import { TEST_PATIENT_INFO } from 'util/data/PatientSample.js';

export const PatientContext = React.createContext()

// Usage: `<PatientProvider patient={123} encounter={123}>{...}</PatientProvider>`
export const PatientProvider = ({ patient, encounter, children }) => {
  const [data, setData] = React.useState(TEST_PATIENT_INFO({ patientMRN: patient }))
  const value = React.useMemo(() => ({ patient, encounter, data, updateData: setData }), [patient, encounter, data])
  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}

// Usage: `const { patient, encounter, data, updateData } = usePatient()`
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
