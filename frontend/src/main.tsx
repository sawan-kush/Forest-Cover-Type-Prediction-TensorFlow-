import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/instrument-sans";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { ResultProvider } from "./lib/ResultContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ResultProvider>
          <App />
        </ResultProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);