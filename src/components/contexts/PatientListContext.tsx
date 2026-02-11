import React, { createContext, useContext } from 'react';

export const PatientListsContext = createContext<any>(undefined);
export const usePatientLists = () => useContext(PatientListsContext);
