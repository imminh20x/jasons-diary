import { useAuth } from '../context/AuthContext';

export const useIsLoggedIn = (): boolean => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn;
};
