/**
 * Capacitor SPA entry point.
 *
 * This is a client-only bootstrap for Android packaging.
 * Unlike the SSR entry (src/start.ts), this renders the app directly
 * in the browser without server-side rendering.
 *
 * Used by: capacitor.html → vite SPA build → Capacitor Android
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { GameAppStandalone } from "./GameAppStandalone";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <GameAppStandalone />
  </StrictMode>
);
