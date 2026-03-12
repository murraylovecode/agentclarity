import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { StatusBar } from '@capacitor/status-bar';

StatusBar.setOverlaysWebView({ overlay: false });

createRoot(document.getElementById("root")!).render(<App />);
