import {useState} from "react";
import TaskBoard from "./TaskBoard";
import AutomationStudio from "./AutomationStudio";
import "./workspace.css";
export default function TasksAutomationsWorkspace(){const [mode,setMode]=useState<"tasks"|"automation">("tasks");return <main className="ta-root"><header><small>MI EMPRESA / OPERACIONES · DEMO</small><h1>{mode==="tasks"?"Tareas":"Automatizaciones"}</h1><p>Tu criterio. El trabajo coordinado por LAIA.</p><nav className="ta-tabs"><button aria-pressed={mode==="tasks"} onClick={()=>setMode("tasks")}>Tareas</button><button aria-pressed={mode==="automation"} onClick={()=>setMode("automation")}>Automatizaciones</button></nav></header><div hidden={mode!=="tasks"}><TaskBoard onAutomation={()=>setMode("automation")}/></div><div hidden={mode!=="automation"}><AutomationStudio/></div></main>}
