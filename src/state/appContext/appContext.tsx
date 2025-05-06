import { ComponentChildren, createContext } from 'preact';
import { useContext, useMemo, useState } from 'preact/hooks';

export interface IAppState {
  error?: Error;
}

export interface IAppActions {
  setError: (error?: Error) => void;
}

export const AppContext = createContext<IAppState & IAppActions>({
  error: undefined,
  setError: () => undefined,
});

export const AppContextProvider = ({ children }: { children: ComponentChildren }) => {
  const [error, setError] = useState<Error>();

  const value = useMemo(() => {
    return {
      error,
      setError,
    };
  }, [error]);

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
