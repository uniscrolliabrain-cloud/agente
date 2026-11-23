Atencion esto no es codigo real solo es para inspiracion igual que las fotos mock up no esta todavia adaptado a la empresa, la data sintetica, ni el branding, los componentes y los iconos todo es mock up, necesita ser reprocesado.

Vale, te lo describo sin chapuzas. Esto es lo que hay **dentro** del móvil / tablet, no la web de fuera.

Es código real, no pseudo-código. El artifact está hecho en **React + TypeScript + Tailwind**, un solo `App.tsx`.

### 1. Tipo de código que usa la pantalla de inicio

**Estructura real:**

```tsx
// App.tsx
type AppId = 'laia' | 'ventas' | 'facturacion' | ...

type AgntiaApp = {
  id: AppId;
  nombre: string;
  categoria: 'Coordinación' | 'Ventas y Clientes' | 'Dinero' | 'Comunicación' | 'Trabajo' | 'Equipo y Agentes' | 'Crecimiento' | 'Sistema';
  icono: LucideIcon; // TrendingUp, Receipt, MessageCircle...
  fondo: string;     // #5B4BDB, #211D18, #F4EEE3...
  iconoColor: string; // #FFFFFF, #211D18, #166534...
  badge?: number | 'URGENTE';
  favorita?: boolean;
  descripcion: string;
}
```

No hay iconos como imágenes. Cada icono es un componente `lucide-react` dentro de un `div` squircle.

**Estado real del Home:**

```tsx
const [device, setDevice] = useState<'movil' | 'tablet'>('movil');
const [pagina, setPagina] = useState<0 | 1>(0); // Home Android tiene páginas
const [drawerAbierto, setDrawerAbierto] = useState(false);
const [carpetaAbierta, setCarpetaAbierta] = useState<string | null>(null);
const [appAbierta, setAppAbierta] = useState<AgntiaApp | null>(null);
const [busqueda, setBusqueda] = useState('');
const [favoritas, setFavoritas] = useState<string[]>(['laia', 'ventas', 'facturacion']);
const [enDescanso, setEnDescanso] = useState(true); // pantalla de descanso / lock
```

### 2. Pantalla en descanso / Lock Screen — código real

Esto es lo que ves cuando el móvil está en descanso, antes de desbloquear. No es una imagen, es un componente:

```tsx
function PantallaDescanso({ onDesbloquear }: { onDesbloquear: () => void }) {
  return (
    <div
      onClick={onDesbloquear}
      className="absolute inset-0 z-50 flex flex-col justify-between overflow-hidden rounded- bg-[#FDFBF7] px-6 pb-8 pt-16 cursor-pointer"
    >
      {/* Wallpaper real: 2 divs con blur, no imagen */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#E7E2F7] blur-" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[#F4EEE3] blur-" />

      {/* Status bar Android */}
      <div className="relative flex items-center justify-between text- font-semibold text-[#211D18]">
        <span>10:05</span>
        <span className="flex items-center gap-1.5">
          <Signal size={15} />
          <Wifi size={15} />
          <BatteryFull size={17} />
          <span>87%</span>
        </span>
      </div>

      {/* Reloj grande estilo Pixel */}
      <div className="relative text-center">
        <p className="text- font-bold uppercase tracking-[0.22em] text-[#85796A]">
          Mar, 23 Nov · Arona
        </p>
        <p className="font-serif-x mt-2 text- leading-[0.9] font-semibold tracking-tight text-[#211D18]">
          10:05
        </p>
        <p className="mt-3 text- text-[#3A332C]">
          Buenos días, Ana · 21° Despejado
        </p>

        {/* Notificaciones estilo Android */}
        <div className="mx-auto mt-6 max-w- space-y-2 text-left">
          <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-[#E8DFD2]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5B4BDB] text-white">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <p className="text- font-bold">LAIA ✦</p>
              <p className="truncate text- text-[#85796A]">
                Tienes 2 aprobaciones. ¿Empezamos por ACME?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-[#E8DFD2]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
              <Receipt size={16} />
            </div>
            <div className="min-w-0">
              <p className="text- font-bold">Facturación</p>
              <p className="truncate text- text-[#85796A]">
                Factura 1042 · 4.800 € vencida
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deslizar para desbloquear */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="h-1.5 w-32 rounded-full bg-[#211D18]/15" />
        <p className="text- font-semibold text-[#85796A]">
          Toca para desbloquear · AgntiaPro
        </p>
      </div>
    </div>
  );
}
```

**Qué hace de verdad:**
- `onClick` en toda la pantalla -> `setEnDescanso(false)`
- No hay `setTimeout` falso para simular desbloqueo. Es un estado booleano.
- El wallpaper son 2 `div` con `blur-`, no una imagen pegada.

### 3. Home con iconos y apps — código real

Este es el corazón. El grid no es una imagen, es un `.map()` sobre el array de 35 apps:

```tsx
function HomeAndroid({
  apps,
  onAbrirApp,
  onAbrirCarpeta,
}: {
  apps: AgntiaApp[];
  onAbrirApp: (app: AgntiaApp) => void;
  onAbrirCarpeta: (id: string) => void;
}) {
  // Paginación real estilo Android: 20 por página en móvil
  const POR_PAGINA = 20;
  const visibles = apps.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  return (
    <div className="relative flex h-full flex-col px-4 pb-28 pt-12">
      {/* Hora + saludo estilo Pixel Launcher */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-serif-x text- leading-none font-semibold">10:05</p>
          <p className="mt-1 text- text-[#85796A]">
            Mar, 23 nov · Buenos días, Ana
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
          <span className="text- font-bold">AF</span>
        </div>
      </div>

      {/* Buscador Pixel */}
      <div className="mt-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-3 shadow-sm ring-1 ring-[#E8DFD2]">
        <Search size={17} className="text-[#85796A]" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar Apps…"
          className="w-full bg-transparent text- outline-none placeholder:text-[#85796A]"
        />
        <Mic size={17} className="text-[#85796A]" />
      </div>

      {/* Widget LAIA 4x2 */}
      <button
        onClick={() => onAbrirApp(apps[0])}
        className="mt-4 flex w-full items-center gap-3 rounded- bg-white/90 p-4 text-left shadow-sm ring-1 ring-[#E8DFD2]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B4BDB] to-[#7C5CFF] text-white">
          <Sparkles size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text- font-bold text-[#C9A86A]">✦ LAIA · Ahora</p>
          <p className="mt-0.5 truncate text- font-semibold text-[#211D18]">
            Tienes 2 aprobaciones. ¿Empezamos por ACME?
          </p>
        </div>
        <ChevronRight size={16} className="text-[#85796A]" />
      </button>

      {/* GRID REAL 4 x 5 */}
      <div className="mt-5 grid grid-cols-4 gap-x-3 gap-y-5">
        {visibles.map((app) => (
          <button
            key={app.id}
            onClick={() => onAbrirApp(app)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <span className="relative flex h- w- items-center justify-center rounded- shadow-sm ring-1 ring-black/5"
              style={{ backgroundColor: app.fondo, color: app.iconoColor }}
            >
              <app.icono size={26} strokeWidth={1.9} />
              {app.badge && (
                <span className="absolute -right-1 -top-1 flex h- min-w- items-center justify-center rounded-full bg-[#5B4BDB] px-1 text- font-bold text-white">
                  {app.badge}
                </span>
              )}
            </span>
            <span className="line-clamp-2 max-w- text-center text- font-medium leading-[1.15] text-[#211D18]">
              {app.nombre}
            </span>
          </button>
        ))}

        {/* Carpetas Android: son botones con mini-grid dentro */}
        <button
          onClick={() => onAbrirCarpeta('ventas')}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="grid h- w- grid-cols-2 gap-1 rounded- bg-[#F4EEE3] p-2 ring-1 ring-[#E8DFD2]">
            <span className="rounded-md bg-[#5B4BDB] flex items-center justify-center text-white"><TrendingUp size={12} /></span>
            <span className="rounded-md bg-[#5B4BDB] flex items-center justify-center text-white"><FileText size={12} /></span>
            <span className="rounded-md bg-[#5B4BDB] flex items-center justify-center text-white"><Users size={12} /></span>
            <span className="rounded-md bg-[#5B4BDB] flex items-center justify-center text-white"><HeartHandshake size={12} /></span>
          </span>
          <span className="text- font-medium">Ventas</span>
        </button>
      </div>

      {/* Indicador páginas Android */}
      <div className="mt-auto flex justify-center gap-1.5 pt-4">
        <span className="h-1.5 w-4 rounded-full bg-[#211D18]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#211D18]/25" />
      </div>
    </div>
  );
}
```

**Puntos clave, sin trampa:**
- `apps.slice(pagina * 20, ...)` es lo que hace que sean 20 por pantalla. No es CSS que aprieta iconos.
- `style={{ backgroundColor: app.fondo }}` viene del array, no de clases inventadas por app.
- `line-clamp-2` es lo que corta el nombre a 2 líneas como Android.
- `active:scale-95` es el feedback táctil real.

### 4. Dock Android — código real

```tsx
function DockAndroid({ onAbrirApp }: { onAbrirApp: (app: AgntiaApp) => void }) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-40">
      <div className="flex items-center justify-between rounded- bg-white/95 px-3 py-2 shadow-lg ring-1 ring-[#E8DFD2] backdrop-blur">
        {/* LAIA */}
        <button onClick={() => onAbrirApp(appLaia)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B4BDB] to-[#7C5CFF] text-white">
          <Sparkles size={22} />
        </button>
        {/* Teléfono */}
        <button onClick={() => onAbrirApp(appTelefono)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#211D18] text-white">
          <Phone size={22} />
        </button>
        {/* Centro - más grande */}
        <button onClick={() => onAbrirApp(appCentro)} className="flex h- w- items-center justify-center rounded-2xl bg-[#211D18] text-white shadow-md">
          <LayoutDashboard size={24} />
        </button>
        {/* WhatsApp */}
        <button onClick={() => onAbrirApp(appWhatsApp)} className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#211D18] text-white">
          <MessageCircle size={22} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5B4BDB] text- font-bold text-white">2</span>
        </button>
        {/* Chat interno */}
        <button onClick={() => onAbrirApp(appChat)} className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#211D18] text-white">
          <MessagesSquare size={22} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5B4BDB] text- font-bold text-white">3</span>
        </button>
      </div>
      {/* Barra de gestos Android */}
      <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-[#211D18]/20" />
    </div>
  );
}
```

### 5. Tablet — mismo código, distinto contenedor

No hay un código distinto para tablet. Es el mismo `HomeAndroid`, solo cambia el marco:

```tsx
<div className={
  device === 'movil'
    ? 'h- w- rounded- border- border-black'
    : 'h- w- rounded- border- border-black'
}>
  {enDescanso ? <PantallaDescanso /> : <HomeAndroid />}
  <DockAndroid />
</div>
```

Y en tablet el grid cambia solo con Tailwind:
```tsx
grid-cols-4 md:grid-cols-6
```

### 6. CSS que sí usa

En `index.css` solo 3 cosas, nada más:

```css
.font-serif-x { font-family: 'Fraunces', serif; }
body { font-family: 'Manrope', sans-serif; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
```

Sin librerías de animación, sin `framer-motion`, sin canvas, sin imágenes de fondo.

---

¿Quieres que te pase ahora el `App.tsx` completo, entero, listo para pegar en tu proyecto, con las 35 apps ya puestas en el array y con la pantalla de descanso + Home + Drawer + Carpetas?
