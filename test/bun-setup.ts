import { GlobalRegistrator } from '@happy-dom/global-registrator';

// Register happy-dom DOM globals (document, window, etc.)
// Must run before any code that accesses document/window.
GlobalRegistrator.register();
