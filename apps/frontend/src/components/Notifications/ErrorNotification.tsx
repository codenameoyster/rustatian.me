import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useError, useSetError } from '@state/appContext/appContext';

export const ErrorNotification = () => {
  const error = useError();
  const setError = useSetError();

  function onCloseHandle() {
    setError(undefined);
  }

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={() => onCloseHandle()}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={() => onCloseHandle()}
        severity="error"
        sx={{ width: '100%' }}
      >
        {error?.message || 'Something went wrong'}
      </MuiAlert>
    </Snackbar>
  );
};
