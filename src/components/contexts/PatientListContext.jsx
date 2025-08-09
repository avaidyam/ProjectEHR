import React, { createContext, useState, useContext } from 'react';

// Create a context for patient lists data
export const PatientListsContext = createContext();

// Custom hook to use the patient lists context
export const usePatientLists = () => useContext(PatientListsContext);
