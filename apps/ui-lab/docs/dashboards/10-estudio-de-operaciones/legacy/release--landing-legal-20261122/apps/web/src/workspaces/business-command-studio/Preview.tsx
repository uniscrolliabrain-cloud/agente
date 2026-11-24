// Standalone review entry for the exact workspace component. No App/auth hooks.
import React from "react";
import { createRoot } from "react-dom/client";
import { BrandLockup } from "../../components/BrandMark";
import BusinessCommandStudio from "./BusinessCommandStudio";
import "./preview.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bcs-review-shell">
      <header className="bcs-review-header">
        <a href="https://www.agntiapro.com" aria-label="AgntiaPro, ir a la web">
          <BrandLockup markSize={30} />
        </a>
        <span>Business Command Studio</span>
        <span className="bcs-review-status">ACME · Demostración interactiva</span>
      </header>
      <BusinessCommandStudio />
    </div>
  </React.StrictMode>,
);
