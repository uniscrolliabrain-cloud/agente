import React from "react";
export function Kanban({ tasks }: { tasks: any[] }) {
  const col = (status: string[]) => tasks.filter((t:any)=> status.includes(t.status));
  const Column = ({ title, items }: any) => (
    <div style={{flex:1, minWidth:280, background:"#f8fafc", borderRadius:12, padding:12}}>
      <h3 style={{fontSize:14, fontWeight:700, marginBottom:8}}>{title} ({items.length})</h3>
      {items.map((t:any)=>(
        <div key={t.id} style={{background:"white", borderRadius:8, padding:10, marginBottom:8, border:"1px solid #e2e8f0"}}>
          <div style={{fontWeight:600, fontSize:13}}>{t.title}</div>
          <div style={{fontSize:11, color:"#64748b", marginTop:4}}>{t.status} {t.kind} {t.state?.sopId ? `SOP:${t.state.sopId}` : ""}</div>
          {t.question && <div style={{marginTop:6, background:"#fef9c3", padding:6, borderRadius:6, fontSize:12}}>❓ {t.question}</div>}
          {t.actionId && <div style={{marginTop:6, fontSize:11, color:"#0f172a"}}>🔒 Necesita validación</div>}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{display:"flex", gap:12, overflowX:"auto", padding:12}}>
      <Column title="En curso" items={col(["queued","running","scheduled"])} />
      <Column title="Necesita validación" items={col(["waiting_approval","waiting_input"])} />
      <Column title="Completado" items={col(["succeeded"])} />
    </div>
  );
}
