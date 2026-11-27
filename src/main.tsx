import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const loadingEl = document.getElementById('app-loading');
if (loadingEl) {
  loadingEl.style.opacity = '0';
  setTimeout(() => loadingEl.remove(), 300);
}

createRoot(document.getElementById("root")!).render(<App />);
