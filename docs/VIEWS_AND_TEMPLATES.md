# Views and Templates Fase2
VIEWS_AND_TEMPLATES V2

## Catalogo cerrado
accepts spec {kind data}
ViewSpec kind=collection|timeline|form|chart
FormSpec fields provenance chips
Intent Resolver input user+fast -> spec

## ViewRenderer
readView precomputada fast
collection cards con provenance
timeline turn.thoughts orden
chips auto-alta media sugerido tu

## FormRenderer
computeView lenta profunda
provenance chips por campo
POST /api/views/resolve spec -> view

## Flujo
fast-author -> readView -> UI inmediata
slow-author -> computeView -> progress
Meta hints slow_ready_fast_idle slice 0..200
Presenter PRIORITY elige response display etc

## Endpoint debug
GET /api/kernel/turns/:turnId debug
POST /api/views/resolve {spec}