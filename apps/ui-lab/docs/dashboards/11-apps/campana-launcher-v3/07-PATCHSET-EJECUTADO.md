# Patchset ejecutado (C05)

## Creado

```
apps/ui-lab/src/apps-launcher/                (14 archivos + 35 iconos WebP 320)
apps/ui-lab/docs/dashboards/11-apps/iconos/   original/, final/{png,webp,manifiesto,contact-sheet},
                                              prompts-definitivos.json, build-icons.py
apps/ui-lab/docs/dashboards/11-apps/campana-launcher-v3/   esta documentación
apps/ui-lab/docs/dashboards/11-apps/qa/        capturas/ + qa-resultados.json
apps/ui-lab/docs/dashboards/11-apps/artifact/  build-artifact.py + README
```

## Modificado

| Archivo | Cambio | Riesgo |
|---|---|---|
| `apps/ui-lab/src/registry.tsx` | Import lazy y entrada `apps-launcher-v3` | Bajo: aditivo, una entrada más |
| `.github/workflows/ui-lab.yml` | Paso que empaqueta `apps-launcher-v3-chromebook` y lo sube como artifact | Bajo: solo CI, sin despliegue |
| `11-apps/README.md` y `11-apps/ESTADO-UX.md` | Estado de la campaña y enlaces | Bajo: documentación |
| `apps/ui-lab/src/apps-launcher/launcher.css` | `.lab-embed:has(.alp-root)` | Acotado a esta vista montada |

## No modificado (verificado en el diff)

- `apps/web/**` completo: producción, 35 workspaces, shell, LAIA, runtime, kernel, integraciones.
- `11-apps/prototipo/**` y `11-apps/componentes-reales/**`: baseline histórico.
- `App.tsx`, `lab.css`, `safety.ts`, `versions.ts`: sin cambios.
- Contratos de API, rutas, permisos y fixtures compartidos: sin cambios.

## Límites de escritura

- CSS con prefijo `alp-` bajo `.alp-root`; sin `:root`, sin `!important` fuera del bloque de reduced
  motion, z-index solo 40/50 dentro del launcher.
- Sin dependencias nuevas.
- 35 archivos de icono de 320 px dentro del bundle (133 kB en total), emitidos por Vite con hash.

## Rollback

1. Quitar la entrada `apps-launcher-v3` y su import de `registry.tsx`.
2. Borrar `apps/ui-lab/src/apps-launcher/`.
3. Revertir el paso del artifact en `ui-lab.yml` y la documentación de campaña.
4. Los iconos y las capturas pueden conservarse como archivo: no afectan al runtime.

No hay migraciones, ni datos, ni endpoints, ni configuración de despliegue: nada más que revertir.

## Commits

Commits pequeños y coherentes en `main`, sincronizando antes de publicar: componentes, iconos,
documentación y CI/artifact. Sin ramas ni PR.
