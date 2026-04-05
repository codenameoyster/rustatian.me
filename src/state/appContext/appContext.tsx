import { GitHubUser } from '@/api/githubRequests';
import { ComponentChildren, createContext } from 'preact';
import { useContext, useMemo, useState } from 'preact/hooks';

interface IAppState {
  error?: Error;
  user?: GitHubUser;
}

interface IAppActions {
  setError: (error?: Error) => void;
  setUser: (user?: GitHubUser) => void;
}

const AppContext = createContext<IAppState & IAppActions>({
  error: undefined,
  setError: () => undefined,
  user: undefined,
  setUser: () => undefined,
});

export const AppContextProvider = ({ children }: { children: ComponentChildren }) => {
  const [error, setError] = useState<Error>();
  const [user, setUser] = useState<GitHubUser>();

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

const useAppContext = () => {
  return useContext(AppContext);
};

export const useError = () => {
  const { error } = useAppContext();
  return error;
};

export const useSetError = () => {
  const { setError } = useAppContext();
  return setError;
};

export const useUser = () => {
  const { user } = useAppContext();
  return user;
};

export const useSetUser = () => {
  const { setUser } = useAppContext();
  return setUser;
};
