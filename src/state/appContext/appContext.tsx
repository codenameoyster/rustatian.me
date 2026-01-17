import { IBaseUser } from '@/api/types';
import { ComponentChildren, createContext } from 'preact';
import { useContext, useMemo, useState } from 'preact/hooks';

export interface IAppState {
  error?: Error;
  user?: IBaseUser;
}

export interface IAppActions {
  setError: (error?: Error) => void;
  setUser: (user?: IBaseUser) => void;
}

export const AppContext = createContext<IAppState & IAppActions>({
  error: undefined,
  setError: () => undefined,
  user: undefined,
  setUser: () => undefined,
});

export const AppContextProvider = ({ children }: { children: ComponentChildren }) => {
  const [error, setError] = useState<Error>();
  const [user, setUser] = useState<IBaseUser | undefined>(undefined);

  const value = useMemo(() => {
    return {
      error,
      setError,
      user,
      setUser,
    };
  }, [error, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};

export const useError = () => {
  const { error } = useAppContext();
  return useMemo(() => error, [error]);
};

export const useSetError = () => {
  const { setError } = useAppContext();
  return useMemo(() => setError, [setError]);
};

export const useUser = () => {
  const { user } = useAppContext();
  return useMemo(() => user, [user]);
};

export const useSetUser = () => {
  const { setUser } = useAppContext();
  return useMemo(() => setUser, [setUser]);
};
