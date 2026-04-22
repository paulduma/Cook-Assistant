import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Élément racine introuvable");
}

try {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Erreur lors du rendu de l'application :", error);
  container.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; color: red;">
      <h1>Erreur de chargement de l'application</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>Consultez la console du navigateur pour plus de détails.</p>
    </div>
  `;
}