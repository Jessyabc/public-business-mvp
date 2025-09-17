import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css';              // your base + tailwind + glass, etc.
import './styles/app-shell.css';   // the new overrides come AFTER index.css

createRoot(document.getElementById("root")!).render(<App />);
