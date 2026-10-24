export function BlockedInvoiceList({ onResolve }: { onResolve: () => void }) {
  return (
    <>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-6 h-6 rounded-full bg-[#111113] text-white grid place-items-center text-[10px] font-bold">CR</div>
          <span className="flex-1 truncate">Carlos Ruiz · Factura 234</span>
          <span className="text-[11px] text-[var(--muted)]">€1.240</span>
        </div>
        <div className="text-[11px] text-[var(--muted)] pl-8">+ 3 más: Gil Proyectos, Torres, Navarro</div>
        <div className="flex gap-1.5 pl-8 pt-1">
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#DBEAFE] text-blue-700">Holded API error</span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Autónomos 20/mes</span>
        </div>
      </div>
      <button onClick={onResolve} className="mt-4 w-full h-9 rounded-full bg-[#6D5BFF] text-white text-[12px] font-medium hover:brightness-105">Resolver con IA →</button>
    </>
  );
}
