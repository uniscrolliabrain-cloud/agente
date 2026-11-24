import type { ReactNode } from "react";
import "./command-center-editorial.css";
/** Presentational only; children retain their existing state and callbacks. */
export function EditorialFrame({children}:{children:ReactNode}) {return <div className="cc-editorial">{children}</div>;}
