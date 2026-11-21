# C01 · Arqueología Git · en curso

Base `3023637d72994460b1aa4742f558557ec0c69922`. Se registraron los commits alcanzables desde las referencias remotas y tags en orden de fecha de commit, con sus padres. Se calcularon merge-base, ahead/behind y equivalencia de patches para cada rama. El inventario de commits alcanza 651 entradas. Los TSV guardan el detalle reproducible de los barridos Git.

W4, W5, W6 y Doppler tienen equivalencia para todos sus commits divergentes según `git cherry`. Su presencia histórica no verifica el comportamiento actual. Runtime C00–C15, stepwise y worker reliability son ancestros de main. La rama WIP móvil es ancestro de la rama del PR #16, que aporta 22 commits sobre main.

Se identificaron dos reversiones explícitas por asunto. `312d2bf` devuelve el alcance de tenant al TenantScopedStore y `a27bda0` retira un botón de escalado desconectado del contrato real. Queda por revisar reversiones implícitas, merges y decisiones de integración por archivo. Los estados HOLD y UNKNOWN mantienen esas decisiones abiertas.

Archivos afectados: inventario, matriz y registros en evidence. Pruebas: comandos Git de solo lectura y revisión del formato del diff. Sin cambios de código. El rollback consiste en revertir el commit documental. NO_GO para declarar cerrada C01 y avanzar a C02.
