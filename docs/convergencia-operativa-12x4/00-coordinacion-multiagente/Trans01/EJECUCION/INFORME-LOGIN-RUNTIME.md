# Trans01 — preflight negativo con LOGIN real

Prueba `9ac1ef6a`, ejecutada en PostgreSQL 17 desechable por socket local: 1/1 PASS, cero SKIP. Crea un LOGIN NOSUPERUSER/NOBYPASSRLS sin propiedad del schema, confirma sus atributos mediante conexión propia y llama al factory normal createStore en otro proceso. El arranque rechaza con SQLSTATE 42501; el proceso termina sin retener la conexión. No usa SET ROLE ni un Store alternativo.

Este PASS prueba el rechazo esperado, NO el funcionamiento de un runtime restringido ni el aislamiento de actores. Confirma el pendiente interno: separar inicialización/migraciones del arranque del rol runtime y después probar el factory real con dos procesos, tenant y ACL. No ampliar permisos del rol como atajo. No se modifica código DB, Supabase ni roles reales.

Log `/tmp/trans01-runtime-login-preflight.log`; ejecución local previa a commit, fixtures y schema/rol efímeros eliminados al terminar. La hipótesis inicial de una conexión retenida no se reprodujo y no se implementó ese supuesto fix.
