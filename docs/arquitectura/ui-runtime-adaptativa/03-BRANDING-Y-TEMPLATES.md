# 03 — Branding determinista consumido directamente por templates

## Decisión cerrada
Los templates están diseñados por el fundador y salen con branding AgntiaPro (colores, tipografía, logos y demás recursos) **por defecto**. Cuando el tenant define su marca en el workspace Branding, **los mismos templates** consumen directamente sus valores. No crear ThemeResolver cognitivo, LLM de diseño, pipeline de CSS generado, forks por cliente ni un segundo sistema de templates.

```text
Templates compartidos (React, programados)
     + branding por defecto AgntiaPro
     + overrides validados del tenant activo
     = interfaz de esa empresa
```

## Modelo de configuración propuesto
```ts
type BrandingConfig = {
  schemaVersion: 1;
  logoUrl?: string; iconUrl?: string;
  colors?: {
    primary?: string; secondary?: string; accent?: string;
    background?: string; surface?: string; text?: string;
  };
  typography?: { family?: string; headingFamily?: string };
  assets?: { coverUrl?: string; avatarPlaceholderUrl?: string };
};
```
El esquema real debe construirse conforme a tokens/componentes actuales. Fallback **por propiedad**, incluidos objetos anidados; un override parcial no debe borrar el resto del theme. Usar validación Zod, lista permitida de tokens, límites de longitud, contraste y URLs de assets seguros. Separar modo claro/oscuro de identidad corporativa, si el sistema soporta ambos.

## Ciclo de vida
1. Workspace Branding lee configuración del tenant autenticado y muestra preview sobre los templates reales.
2. El usuario con capacidad de edición cambia logo/paleta/tipografía/recursos; se valida y guarda configuración versionada.
3. Los templates consumen branding efectivo, sin rebuild ni despliegue por cliente.
4. Los clientes activos reciben actualización/revalidación según la política de publicación.
5. Si un valor falta o es inválido, se usa fallback AgntiaPro; jamás permitir CSS/HTML/script arbitrario ni acceso cross-tenant.
6. Registrar auditoría de cambios, actor y versión. Considerar borrador/publicación como UX opcional, **no requisito para inventar un motor de branding**.

## Límites
Branding no cambia la jerarquía de permisos, catálogo de capabilities, SOPs, contratos de datos ni UI commands. La personalización del menú es otra capacidad de los componentes; no debe almacenarse dentro de branding salvo opciones visuales explícitas. No usar IP para inferir tenant o idioma; identidad, locale y preferencias se resuelven por mecanismos separados.

## Pruebas
- Tenant A sin overrides ve AgntiaPro.
- Tenant B con color primario y logo propios mantiene defaults en propiedades restantes.
- Cambiar tenant limpia cachés de branding anterior.
- El mismo template no cambia estructura por tener otra marca.
- Contraste, responsive, modo oscuro, fallback, error de asset y aislamiento multiusuario.
- Actualización de branding no altera permisos ni ejecución.
