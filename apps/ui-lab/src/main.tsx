import "./safety";
import React from "react";
import { createRoot } from "react-dom/client";
import "../../web/src/index.css";
import "./lab.css";
import App from "./App";
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
