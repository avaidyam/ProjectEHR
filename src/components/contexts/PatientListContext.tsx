import * as React from 'react';

export const PatientListsContext = React.createContext<any>(undefined);
export const usePatientLists = () => React.useContext(PatientListsContext);
