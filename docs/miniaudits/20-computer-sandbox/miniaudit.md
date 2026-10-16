# 20 — Computer sandbox

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump computer.ts, apps/computer/*, COMPUTER.md, código real

## Ontología

ComputerService, ComputerCommand, DockerRunner, runDocker, aislamiento (readonly, cap-drop ALL, no-new-privileges, network none, 512MB, 1 CPU, 128 pids, tmpfs 64MB), files.py, /workspace persistente.

## Estado real

Docker sin red. 512MB. 1 CPU. 128 pids. --cap-drop ALL. no-new-privileges. --read-only. tmpfs 64MB. /workspace persistente. Timeout 30s. Output 128KB. files.py con rechazo de symlinks.

## Evidencia

Los 12 tests de computer.test.ts pasan (aislamiento, timeouts, Stop, quarantine, recuperación de lease, inyección argv, paths).

## Huecos declarados

- Cuotas de disco por volumen.
- Rotación de contenedores huérfanos.
- Telemetría de uso.
- Más lenguajes.

## Huecos profundos (auditoría extendida)

1. **`DockerRunner` no expone el container a métricas**: no se puede saber qué container usa qué RAM.
2. **Sin "disk quota por volumen"**: `/workspace` puede crecer hasta llenar el host.
3. **Sin "sweeper de huérfanos"**: si el API crashea, el container sigue vivo. Sin limpieza.
4. **Sin "log de comandos"**: no hay history de qué comandos se ejecutaron por task.
5. **`files.py` sin límite de profundidad**: un path con 100 niveles se procesa. Path traversal mitigation pero sin tope.
6. **`files.py` sin límite de files por directorio**: 1M files en /workspace hace el scandir lento.
7. **Sin "cache de imágenes"**: cada `docker run` puede descargar la imagen si no está local.
8. **`spawn("docker", ...)` sin verificar que docker sea el binario correcto**: si el PATH es raro, ejecuta otro.
9. **Sin "resource monitor"**: no se sabe si el container está cerca del límite.
10. **Sin "kill grace period configurable"**: 2s hardcoded.
11. **Sin "docker exec con timeout real"**: si el comando ignora SIGTERM, el kill tarda.
12. **Sin "fallback a shell nativo"**: correcto (no hay), pero documentar por qué.
13. **Sin "comandos permitidos / prohibidos"**: cualquier comando vale. Un rm -rf borra todo.
14. **Sin "audit de comandos peligrosos"**: no se registra si alguien intentó ejecutar algo destructivo.
15. **Sin "cuota de CPU seconds por tenant"**: un tenant puede consumir 100% del CPU.
16. **Sin "snapshot del workspace"**: no se puede "guardar el estado" del sandbox.
17. **Sin "restore del workspace"**: si el tenant lo rompe, no hay recuperación.
18. **Sin "multi-lenguaje"**: solo bash, python3, node, git. Falta go, rust, java.
19. **Sin "output streaming"**: el output se espera completo antes de devolverlo.
20. **Sin "environment variables aisladas"**: el container hereda HOME=/workspace pero podría heredar más.

## Interrelación

Sandbox externo. Depende de 06, 17.

## Riesgos

Comando llena el disco. Contenedor huérfano bloquea. Fallo de Docker deja tarea inconsistente.

## Tipo de fixes

Cuota de disco real. Sweeper de contenedores con lease expirado. Métricas de uso. Comandos prohibidos. Output streaming. Snapshot. Restore.
