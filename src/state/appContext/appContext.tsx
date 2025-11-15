import { getUser } from '@/api/githubRequests';
import { IBaseUser } from '@/api/types';
import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';

const useFetchUser = (setUser: (user?: IBaseUser) => void, setError: (error?: Error) => void) => {
  useEffect(() => {
    getUser()
      .then(data => {
        setUser(data);
      })
      .catch(error => {
        setError(error);
      });
  }, [setUser, setError]);
};

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

  useFetchUser(setUser, setError);

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
