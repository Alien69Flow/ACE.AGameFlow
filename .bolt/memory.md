# Project memory

## Product intent & audience

- Juego de gestión/estrategia con edificios, minijuegos y economía de recursos, ambientado en un planeta.
- Plataforma web con backend y frontend 3D (Three.js + React).
- Jugador gestiona edificios en un planeta y juega minijuegos que otorgan boosts.

## Brand personality & voice

- Comunicación directa y honesta con el usuario (ej.: reconocer qué falta implementar).
- Tono conversacional en español.

## Visual design & UX direction

- Frontend 3D: modelos 3D de edificios sobre un planeta.
- UI de edificios: paneles para construir/mejorar en slots numerados (2–12).
- Pantalla de minijuegos ("Games Hub") con selección de juegos y boosts por edificio.
- Riesgo conocido: pantalla en negro o crash si se pasan props `undefined` desde `useGameState` a componentes hijos.

## Decisions, constraints & rationale

- **Arquitectura:** Backend con `buildings.ts` y migraciones SQL; estado frontend centralizado en hook `useGameState`.
- **Edificios definidos (backend):** 11 edificios en slots 2–12. Los 6 nuevos incluyen: mina, refinería, defensa, hangar, orbital.
- **Minijuegos definidos (backend):** 6 totales — 4 iniciales + Tower Defense + Tech Puzzle.
- **Sistema de recursos:** 3 tipos — minerales, datos, influencia.
- **Estado de implementación:**
  - Edificios 2–6: backend ✅ frontend ✅ (modelos 3D + UI).
  - Edificios 7–12: backend ✅ frontend ❌ (sin modelos 3D ni UI).
  - 4 minijuegos iniciales: backend ✅ frontend ✅.
  - Tower Defense y Tech Puzzle: backend ✅ frontend ❌.
  - Economía de recursos: backend ✅ (DB) frontend ❌ (no conectada).
  - Games Hub con boosts: backend ✅ frontend ❌.
- **Bug crítico:** `Index.tsx` pasa props `gameResources`, `fetchGameResources`, `buyGameBuilding` a la pantalla de minijuegos, pero esas funciones **no existen** en `useGameState` — llegan como `undefined`, causando pantalla negra o crashes.

## Open questions & assumptions

- Pendiente de decisión del usuario: qué bloque implementar primero (edificios nuevos, minijuegos faltantes, o conexión de recursos), o si quiere los tres a la vez.
- Se asume que el backend y las migraciones están correctos y no requieren cambios; el trabajo pendiente es solo frontend.
- No está confirmado si `useGameState` necesita nuevas funciones (`fetchGameResources`, `buyGameBuilding`, `gameResources`) o si `Index.tsx` debe usar las funciones existentes con otro nombre.