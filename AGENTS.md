# Cerebritos App — Instrucciones para agentes

Plataforma educativa (React Native/Expo + React + Firebase). El repo git es este directorio
(`cerebritos-app/`); la carpeta contenedora que lo envuelve NO es repo (su `package.json` es `{}`).
Tres subproyectos npm independientes, sin workspaces ni raíz compartida con scripts.

## Comandos reales (los únicos que existen)

NO uses los scripts que citan `README.md` y `docs/development.md` (`install:all`, `dev:all`,
`clean`, `install-all`, `web:dev`, `mobile:android`, `functions:serve`, `test:e2e`,
`build:android`): no están definidos en ningún `package.json`.

| Subproyecto | Comandos |
|---|---|
| `mobile-app/` (Expo SDK 49, RN 0.72) | `npm start` (Expo dev server); `npm run android\|ios\|web` |
| `web-dashboard/` (Create React App + TS) | `npm start` (http://localhost:3000); `npm run build` (→ `web-dashboard/build/`) |
| `firebase-functions/` (TS → `lib/`, Node 20) | `npm run build` (tsc); `npm run serve` (emulador functions :5001); `npm run deploy` |

- No hay tests en ningún subproyecto. `npm test` en web-dashboard es react-scripts (Jest) y entra
  en watch con "No tests found". No hay lint configurado.
- Emuladores (`firebase emulators:start` desde la raíz): auth 9099, functions 5001, firestore 8080,
  hosting 5000, UI habilitada (default :4000). El hosting sirve `web-dashboard/build`, así que corre
  `npm run build` ahí primero.
- Proyecto Firebase: `cerebritos-app` (ver `.firebaserc`). Deploy requiere `firebase login` y ser
  dueño del proyecto; `npm run deploy` sólo despliega functions.

## Arquitectura

- `mobile-app/` — app del estudiante. Las pantallas viven en la RAIZ del package (NO en `src/`):
  `App.tsx` (ruteo manual sobre estado: `login/study/quiz/home`), `AppComponents.tsx`
  (BottomNavigation), `QuizScreen.tsx`, `StudyScreen.tsx`; servicios en `services/` (`firebase.js`,
  `aiService.js`, `gemini.js`, `openai.js`). No usa react-navigation.
- `web-dashboard/` — panel de padres. `src/pages/Login.tsx`, `Dashboard.tsx`; acceso a datos en
  `src/services/firebase.ts`.
- `firebase-functions/` — 3 funciones HTTP (`onRequest`) en `src/index.ts` (`generateQuiz`,
  `generateFeedback`, `adaptDifficulty`), CORS abierto y fallbacks hardcodeados en español si OpenAI
  falla. El cliente todavía no las consume (P-6).
- Firestore: colecciones y campos en español (`usuarios` keyed por el `uid` de Auth, `progresoTemas`,
  `insignias`, `vinculosPadreHijo`, `cuestionarios`, `temas`, `materias`).
- La config de Firebase está duplicada: `mobile-app/firebase.config.js` y
  `web-dashboard/src/services/firebase.ts` (claves web públicas del proyecto `cerebritos-app`).
  Si cambia el proyecto, actualizá ambas.

## Gotchas

- **`mobile-app/` es un gitlink sin `.gitmodules`** (entrada modo 160000 en el índice del padre):
  tiene su propio `.git` y commits propios. Para editar ahí, los commits van en el repo interno; el
  padre sólo ve el puntero. Un `git clone` del repo padre NO trae el contenido de `mobile-app/`
  (queda vacío; `git submodule update` no funciona sin `.gitmodules`).
- **Estado local sin commitear (al 15/09/2026)**: `web-dashboard/src/services/firebase.ts`
  (fix P-1) modificado y `docs/pendientes.md` untracked. Es una foto puntual: verificá con
  `git status` antes de confiar.
- **Motor de IA**: `mobile-app/services/aiService.js` tiene `AI_ENGINE = 'openai'` hardcodeado y
  cae al otro motor si falla. `config/aiConfig.js` no lo importa nadie; `scripts/change-ai-engine.bat`
  escribe `.env.local` que el código ignora (y ofrece "Hugging Face" inexistente).
- **Claves**: el móvil lee `EXPO_PUBLIC_GEMINI_API_KEY` / `EXPO_PUBLIC_OPENAI_API_KEY` de
  `mobile-app/.env`; functions lee `OPENAI_API_KEY` de `firebase-functions/.env`. Ya se purgaron
  keys del historial (15/09/2026). `.env` está en `.gitignore`: no lo committees.
- **Expo SDK 49 es viejo**: Expo Go de la store actual soporta SDKs recientes; la app puede no abrir
  en un device sin actualizar el SDK o usar una versión vieja de Expo Go.
- **Reglas de Firestore**: `firestore.rules` exige propiedad por `request.auth.uid`, pero varios
  `create` quedan denegados porque validan `resource.data`, que no existe al crear (`materias`,
  `temas`, `vinculosPadreHijo`) — bug conocido (P-4). Al tocar reglas recordá que escribe sobre
  datos en español.

## Estado del proyecto y documentación

- `docs/pendientes.md` es la fuente viva y confiable del estado: P-1 (registro web) resuelto
  15/09/2026; P-2..P-8 abiertos (navegación móvil con pantallas muertas, selector de motor IA roto,
  vínculo padre-hijo roto, dashboard con datos inventados, functions sin conectar, docs ficticios,
  fallback de Gemini con `source` falso).
- `README.md` y `docs/development.md` están parcialmente ficticios: describen estructura
  (`src/components`, `android/`, `shared/`), scripts y CI que no existen (no hay `.github/`).
  Confiá en `docs/pendientes.md` y en el código, no en esos docs.
- `docs/setup-guide.md` documenta el setup manual de Firebase (crear proyecto, Auth, Firestore).
- `prompt-maestro.toml` configura el harness de agentes Prompt Maestro: por ahora solo pueden
  escribir en `web-dashboard/src` (tests junto al código, `*.test.ts(x)`), con `tsc` y Jest como
  gates. No lo modifiques desde un agente: el harness lo protege.
- Idioma del proyecto: español (UI, comentarios, nombres de colecciones) — mantenelo.

## Mantenimiento (convención)

- **Convención**: si tu cambio altera comandos, estructura o estado del proyecto, actualizá este
  archivo en el mismo commit. Nunca quede más atrás que el repositorio.
- **Verificación**: antes de confiar en una ruta o comando citado acá, contrastalo contra el código
  (`package.json`, `glob`, `git status`). Este archivo es una foto que puede quedar vieja; el código
  manda.