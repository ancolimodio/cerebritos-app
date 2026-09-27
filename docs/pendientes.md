# 📋 Pendientes — Cerebritos App

Documento de trabajo con las funcionalidades a medio implementar o rotas. Se atacan de a una, en orden de prioridad.

## Orden de prioridad

1. [x] **P-1: Registro desde web incompatible con el flujo de datos**
   - `web-dashboard/src/services/firebase.ts:86` (`AuthService.signUp`) crea el usuario con `addDoc` → docId aleatorio; todo el resto del código usa el `uid` de Auth como id de usuario → el padre registrado en la web no se encuentra con `getUserData(uid)`, no puede vincular hijos ni cargar su propio perfil.
   - Fix: crear el doc con `setDoc(doc(db, 'usuarios', user.uid))` como hace la app móvil. ✅ **Resuelto 15/09/2026** (la lectura del perfil real en el dashboard sigue pendiente — ver P-5).

2. [ ] **P-2: Navegación móvil con pantallas muertas**
   - `AppComponents.tsx` (BottomNavigation) navega a `achievements`, `test` y `profile`, pero `App.tsx` solo maneja `login/study/quiz/home` → esas pantallas no existen (caen a Home).
   - `onShowProfile={() => {}}` vacío en `App.tsx:231`.
   - Fix: implementar pantallas de Logros y Perfil (o quitar los botones del nav).

3. [ ] **P-3: Configuración del motor de IA no funciona**
   - `services/aiService.js:5` tiene `AI_ENGINE = 'openai'` hardcodeado.
   - `config/aiConfig.js` no lo importa nadie; `change-ai-engine.bat` escribe `.env.local` que el código ignora.
   - `AI_ENGINE_SETUP.md` promete Hugging Face, que no existe.
   - Fix: leer el motor desde `.env` (`EXPO_PUBLIC_AI_ENGINE`) y wire `aiConfig.js`, o eliminar la promesa de dualidad.

4. [ ] **P-4: Vinculación padre-hijo rota**
   - `firestore.rules` deniega la creación de vínculos (`create` sin `resource.data`).
   - `isParentOf` busca doc `idPadre_idHijo` pero el código crea con `addDoc` → nunca matchea.
   - `generateVinculationCode` (`mobile/services/firebase.js:123`) definido pero sin UI.
   - Fix: corregir reglas (permitir `create` validando `request.resource.data`), unificar formato de vínculos, decidir flujo (email vs código).

5. [ ] **P-5: Dashboard web muestra datos inventados**
   - `Dashboard.tsx:72-141` y `146-147` rellenan con ejemplos hardcodeados y estiman tiempo (`count * 15 min`) cuando no hay datos reales.
   - `App.tsx` (web) construye un `user` fake sin leer Firestore (perfil vacío).
   - Fix: leer perfil real desde Firestore y mostrar datos reales (o estado "sin datos").
   - Avance 27/09/2026: el tiempo de estudio ya no usa mínimos inventados (3 h total, 45 min semanales); lo calcula `calcularTiempoEstudio` (`web-dashboard/src/utils/tiempoEstudio.ts`, con tests). Sigue estimando 15 min por registro hasta consumir `intentosCuestionario` (P-6). Los ejemplos hardcodeados y el `user` fake siguen pendientes.

6. [ ] **P-6: Cloud Functions sin conectar**
   - `httpsCallable` importado pero nunca usado (`mobile/services/firebase.js:20`).
   - `QuizScreen` usa OpenAI directo desde el cliente, no la función `generateQuiz`.
   - `adaptDifficulty` usa `fetch` a una URL de producción (`firebase.js:326`) que puede no estar deployada.
   - `intentosCuestionario` se guarda pero nadie lo lee.
   - Fix: rutear generación de quiz/feedback por Cloud Functions y consumir `intentosCuestionario` en el dashboard (para reemplazar los estimados del P-5).

7. [ ] **P-7: Docs desactualizados / ficticios**
   - `docs/development.md` describe estructura (`src/components`, `android/`, `ios/`) y scripts (`install-all`, `web:build`, `functions:serve`) que no existen.
   - Root `package.json` vacío (`{}`) pero README y docs referencian `npm run install:all`, `dev:all`, `clean`.
   - Fix: alinear docs con la estructura real.

8. [ ] **P-8: Fallback de Gemini reporta una fuente falsa**
   - `services/gemini.js:68-73`: cuando usa preguntas estructuradas locales devuelve `source: 'gemini'`, aunque no tocó Gemini.
   - Fix: devolver `source: 'local'` (o `'structured'`).

## Notas / decisiones pendientes
- Definir si los vínculos padre-hijo usan **email** o **código de vinculación** (ambos flujos coexisten hoy).
- Definir si el motor de IA se centraliza en **Cloud Functions** (recomendado para no exponer claves en el cliente).
- Revocar API keys comprometidas (OpenAI) y regenerar Gemini.

## Historial
- 15/09/2026: se purgaron API keys de OpenAI/Gemini del código e historial; se refactorizó a variables de entorno (`mobile-app/.env`).
- 15/09/2026: se eliminó el token `ghp_...` de la URL del remote del repo padre.
- 15/09/2026: **P-1 resuelto** — `AuthService.signUp` (web) ahora usa `setDoc` con el `uid` de Auth como id, consistente con la app móvil.
- 27/09/2026: P-5 parcial — tiempo de estudio sin mínimos inventados; primer test del proyecto. Implementado por los agentes de Prompt Maestro (Gemini) y revisado a mano: se quitaron dos propiedades `disaster_fix` que el agente había inyectado fuera del plan.