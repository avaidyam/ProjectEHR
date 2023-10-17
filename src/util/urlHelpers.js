import { useNavigate, useSearchParams } from 'react-router-dom';

import { URL_KEYS } from './constants.js';

/**
 * hook to extract mrn from url and set new one
 *
 * usage: `const [patientMRN, setPatientMRN] = usePatientMRN();`
 *
 * *must* be used from within a functional component
 */
export const usePatientMRN = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return [
    searchParams.get(URL_KEYS.MRN),
    (value) =>
      setSearchParams((params) => {
        params.set(URL_KEYS.MRN, value);

        return params;
      }),
  ];
};

/**
 *
 * hook to set new root routes within app, ie /#/schedule or /#/notes, etc
 *
 * usage: `const onSetNewRouter = useRouter({onAfterRoute: thisFunctionExecutesAfterRouting });`
 *
 * *must* be used from within a functional component
 */
export const useRouter = ({ onAfterRoute = null, preserveQueryParams = true } = {}) => {
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();

  return (route) => {
    const update = { pathname: `/${route}` };

    if (preserveQueryParams) {
      update.search = searchParams.toString();
    }

    navigator(update);

    if (onAfterRoute) {
      onAfterRoute();
    }
  };
};
