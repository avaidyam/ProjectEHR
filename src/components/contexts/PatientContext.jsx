import * as React from 'react'
import { TEST_PATIENT_INFO } from 'util/data/PatientSample.js';

export const PatientContext = React.createContext()

// Usage: <PatientProvider patient={123} encounter={123}>{...}</PatientProvider>
export const PatientProvider = ({ patient, encounter, children }) => {
  const [data, setData] = React.useState(TEST_PATIENT_INFO({ patientMRN: patient }))
  const value = React.useMemo(() => ({ patient, encounter, data, updateData: setData }), [patient, encounter, data])
  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}

// Usage: const { patient, encounter, data, updateData } = usePatient()
export const usePatient = () => {
  const ctx = React.useContext(PatientContext)
  if (ctx === undefined) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return ctx
}
