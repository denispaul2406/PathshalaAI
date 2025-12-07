import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { registerServiceWorker } from "./services/offline";
import { setupMobileViewport, preventDoubleTapZoom } from "./utils/mobile";

// Setup mobile optimizations
setupMobileViewport();
preventDoubleTapZoom();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker().catch(console.error);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
