import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css';

// Performance: Start rendering as soon as possible
const rootElement = document.getElementById("root")!;

// Clear the loading fallback before hydrating
if (rootElement.firstElementChild?.classList.contains('loading-fallback')) {
  rootElement.innerHTML = '';
}

// Defensive error handling for production
try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Failed to mount app:', error);
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
      <h2 style="color: #ef4444; margin-bottom: 16px;">App failed to load</h2>
      <p style="color: #666; margin-bottom: 16px;">Please try refreshing the page.</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Refresh Page
      </button>
    </div>
  `;
}
