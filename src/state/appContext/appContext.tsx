import { type ComponentChildren, createContext } from 'preact';
import { useContext, useMemo, useState } from 'preact/hooks';

interface AppState {
  error?: Error | undefined;
}

interface AppActions {
  setError: (error?: Error) => void;
}

type AppContextValue = AppState & AppActions;

// Default of `null` (rather than a noop object) so consumers rendered outside
// the provider fail loudly in the hook rather than silently swallowing state.
const AppContext = createContext<AppContextValue | null>(null);

export const AppContextProvider = ({ children }: { children: ComponentChildren }) => {
  const [error, setError] = useState<Error>();

  const value = useMemo<AppContextValue>(() => ({ error, setError }), [error]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (ctx === null) {
    throw new Error('useAppContext must be used within <AppContextProvider>');
  }
  return ctx;
};

export const useError = () => useAppContext().error;

export const useSetError = () => useAppContext().setError;
