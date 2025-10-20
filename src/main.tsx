import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css';
import { ENABLE_LEGACY_STYLES } from './config/uiFlags';

// Conditionally load legacy stylesheets
if (ENABLE_LEGACY_STYLES) {
  import('./styles/legacy/base.css');
  import('./styles/legacy/glass.css');
  import('./styles/legacy/postcards.css');
  import('./styles/legacy/app-shell.css');
}

createRoot(document.getElementById("root")!).render(<App />);
