export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div className="pointer-events-auto rounded-full bg-[#111113] text-white px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.24)] flex items-center gap-2 text-[12px] font-medium">
        <span className="w-5 h-5 rounded-full bg-[#6D5BFF] grid place-items-center text-[12px]">✦</span>
        {message}
      </div>
    </div>
  );
}
