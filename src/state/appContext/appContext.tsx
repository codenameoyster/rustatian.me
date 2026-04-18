import { type ComponentChildren, createContext } from 'preact';
import { useContext, useMemo, useState } from 'preact/hooks';

interface IAppState {
  error?: Error | undefined;
}

interface IAppActions {
  setError: (error?: Error) => void;
}

const AppContext = createContext<IAppState & IAppActions>({
  error: undefined,
  setError: () => undefined,
});

export const AppContextProvider = ({ children }: { children: ComponentChildren }) => {
  const [error, setError] = useState<Error>();

  const value = useMemo(
    () => ({
      error,
      setError,
    }),
    [error],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => useContext(AppContext);

export const useError = () => useAppContext().error;

export const useSetError = () => useAppContext().setError;
