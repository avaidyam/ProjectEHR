import React, { createContext, useContext } from 'react';

export const PatientListsContext = createContext();
export const usePatientLists = () => useContext(PatientListsContext);
