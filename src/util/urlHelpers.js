import { useNavigate, useSearchParams } from 'react-router-dom';

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
