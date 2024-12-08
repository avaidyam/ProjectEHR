import { useNavigate, useSearchParams, generatePath, useParams } from 'react-router-dom';

/**
 * hook to extract mrn from url and set new one
 *
 * usage: `const [patientMRN, setPatientMRN] = usePatientMRN()`
 *
 * *must* be used from within a functional component
 */
export const usePatientMRN = () => {
  const { mrn } = useParams()
  const navigate = useNavigate()
  return [
    mrn,
    (value) => navigate(generatePath('/patient/:mrn', { mrn: value })),
  ];
};

/**
 * hook to extract mrn from url and set new one
 *
 * usage: `const [enc, setEnc] = useEncounterID()`
 *
 * *must* be used from within a functional component
 */
export const useEncounterID = () => {
  const { mrn, enc } = useParams()
  const navigate = useNavigate()
  return [
    enc,
    (value) => navigate(generatePath('/patient/:mrn/encounter/:enc', { mrn: mrn, enc: value })),
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
