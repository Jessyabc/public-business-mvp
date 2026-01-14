import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css';

// Performance: Start rendering as soon as possible
const rootElement = document.getElementById("root")!;

// Clear the loading fallback before hydrating
if (rootElement.firstElementChild?.classList.contains('loading-fallback')) {
  rootElement.innerHTML = '';
}

createRoot(rootElement).render(<App />);
