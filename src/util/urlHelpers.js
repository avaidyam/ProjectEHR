import { useSearchParams } from "react-router-dom";

import { URL_KEYS } from "./constants.js";

/**
 * hook to extract mrn from url
 * *must* be used from within a functional component
 */
export const getPatientMRN = () => {
  const [searchParams] = useSearchParams();

  return searchParams.get(URL_KEYS.MRN);
};
