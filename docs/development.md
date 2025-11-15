# 🛠️ Guía de Desarrollo - Cerebritos

## 📁 Estructura del Proyecto

```
cerebritos-app/
├── mobile-app/              # App React Native
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── screens/         # Pantallas de la app
│   │   ├── navigation/      # Configuración de navegación
│   │   ├── services/        # Servicios de Firebase
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Utilidades
│   ├── android/             # Configuración Android
│   ├── ios/                 # Configuración iOS
│   └── package.json
├── web-dashboard/           # Dashboard React para padres
│   ├── src/
│   │   ├── components/      # Componentes web
│   │   ├── pages/           # Páginas del dashboard
│   │   └── services/        # Servicios compartidos
│   └── package.json
├── firebase-functions/      # Backend serverless
│   ├── src/
│   │   └── index.ts         # Funciones principales
│   └── package.json
├── shared/                  # Código compartido
├── docs/                    # Documentación
└── scripts/                 # Scripts de automatización
```

## 🚀 Comandos de Desarrollo

### Configuración Inicial
```bash
# Ejecutar script de configuración
./scripts/setup.sh          # Linux/macOS
scripts\setup.bat           # Windows

# O manualmente:
npm run install-all
```

### Desarrollo Local
```bash
# App móvil
npm run mobile:android       # Android
npm run mobile:ios          # iOS (solo macOS)

# Dashboard web
npm run web:dev             # http://localhost:3000

# Backend local
npm run functions:serve     # http://localhost:5001
```

### Emuladores Firebase
```bash
firebase emulators:start
```
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Hosting: http://localhost:5000

## 🏗️ Arquitectura de Componentes

### App Móvil (React Native)

#### Componentes Base
- **Button**: Botón reutilizable con gradientes
- **Input**: Campo de entrada con validación
- **MateriaCard**: Tarjeta de materia con progreso

#### Pantallas Principales
- **LoginScreen**: Autenticación de usuarios
- **RegisterScreen**: Registro con validación
- **HomeScreen**: Dashboard principal
- **StudyScreen**: Selección de temas
- **QuizScreen**: Cuestionarios interactivos
- **ResultsScreen**: Resultados y feedback
- **AchievementsScreen**: Logros y insignias
- **ProfileScreen**: Perfil y configuración

#### Navegación
- **Stack Navigator**: Pantallas principales
- **Tab Navigator**: Navegación inferior
- **Auth Flow**: Flujo de autenticación

### Dashboard Web (React)

#### Páginas
- **Login**: Autenticación de padres
- **Dashboard**: Métricas y progreso

#### Componentes
- Gráficos con Recharts
- Cards de estadísticas
- Tablas de progreso

## 🔥 Firebase Integration

### Authentication
```typescript
import { AuthService } from '../services/firebase';

// Registro
const result = await AuthService.signUp(email, password, userData);

// Login
const result = await AuthService.signIn(email, password);

// Logout
await AuthService.signOut();
```

### Firestore
```typescript
import { MateriaService } from '../services/firebase';

// Obtener materias
const materias = await MateriaService.getMaterias(userId);

// Crear materia
const result = await MateriaService.createMateria(materiaData);
```

### Functions
```typescript
import { QuizService } from '../services/firebase';

// Generar cuestionario con IA
const quiz = await QuizService.generateQuiz(temaId, 'medio', 10);
```

## 🤖 Integración OpenAI

### Configuración
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Generación de Cuestionarios
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: 'Eres un asistente educativo...',
    },
    {
      role: 'user',
      content: prompt,
    },
  ],
  temperature: 0.7,
});
```

## 🎨 Guía de Estilos

### Colores Principales
```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--background-gradient: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
--success-color: #4caf50;
--warning-color: #ff9800;
--error-color: #f44336;
```

### Tipografía
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Espaciado
- Padding: 8px, 12px, 16px, 20px, 24px
- Margin: 8px, 16px, 24px, 32px
- Border Radius: 8px, 12px, 16px

## 🧪 Testing

### Unit Tests
```bash
# App móvil
cd mobile-app
npm test

# Dashboard web
cd web-dashboard
npm test

# Functions
cd firebase-functions
npm test
```

### E2E Tests
```bash
# Configurar Detox para React Native
npm run test:e2e
```

## 📱 Build y Deploy

### App Móvil
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

### Dashboard Web
```bash
npm run web:build
```

### Firebase Deploy
```bash
# Todo el proyecto
firebase deploy

# Solo functions
firebase deploy --only functions

# Solo hosting
firebase deploy --only hosting
```

## 🐛 Debugging

### React Native
```bash
# Logs Android
npx react-native log-android

# Logs iOS
npx react-native log-ios

# Flipper para debugging
npx react-native start
```

### Firebase Functions
```bash
# Logs locales
firebase functions:log

# Logs en producción
firebase functions:log --only functionName
```

## 📊 Monitoreo

### Firebase Analytics
- Eventos de usuario
- Métricas de rendimiento
- Crashlytics

### Performance
- Tiempo de carga
- Uso de memoria
- Errores de red

## 🔒 Seguridad

### Reglas Firestore
```javascript
// Solo el propietario puede acceder
allow read, write: if request.auth != null && 
  resource.data.idUsuario == request.auth.uid;
```

### Variables de Entorno
```bash
# Nunca commitear claves reales
OPENAI_API_KEY=sk-...
FIREBASE_API_KEY=AIza...
```

## 🚀 CI/CD

### GitHub Actions
```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: firebase deploy
```

## 📝 Convenciones de Código

### Naming
- Componentes: PascalCase
- Funciones: camelCase
- Constantes: UPPER_SNAKE_CASE
- Archivos: kebab-case

### Commits
```
feat: agregar pantalla de cuestionarios
fix: corregir navegación en iOS
docs: actualizar README
style: mejorar estilos de botones
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📚 Recursos Adicionales

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Firebase Docs](https://firebase.google.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Troubleshooting

### Problemas Comunes

#### Metro bundler error
```bash
npx react-native start --reset-cache
```

#### Android build error
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### Firebase emulator issues
```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

#### OpenAI API rate limit
- Verificar límites en dashboard
- Implementar retry logic
- Usar cache para respuestas