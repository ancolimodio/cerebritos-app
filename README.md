# 🧠 Cerebritos App

**Plataforma educativa inteligente para estudiantes de primaria con seguimiento parental**

Una aplicación completa que combina aprendizaje gamificado para estudiantes y monitoreo detallado para padres, potenciada por inteligencia artificial.

## 📱 Características Principales

### Para Estudiantes (App Móvil)
- 🎯 **Cuestionarios Interactivos** - Preguntas generadas por IA sobre múltiples materias
- 🏆 **Sistema de Gamificación** - Puntos, niveles, insignias y rachas de estudio
- 📚 **Múltiples Materias** - Matemáticas, Ciencias, Lengua, Historia y más
- 🤖 **IA Dual** - Dos agentes de IA: Google Gemini y OpenAI, intercambiables por configuración
- 📊 **Progreso en Tiempo Real** - Seguimiento automático del rendimiento
- 🎨 **Interfaz Amigable** - Diseño intuitivo adaptado para niños

### Para Padres (Dashboard Web)
- 📈 **Monitoreo Completo** - Progreso detallado por materia y tema
- ⏱️ **Tiempo de Estudio** - Tracking automático de horas dedicadas
- 🎯 **Estadísticas Avanzadas** - Aciertos, porcentajes, notas promedio
- 📅 **Actividad Reciente** - Historial de cuestionarios realizados
- 🏅 **Insignias Obtenidas** - Logros y reconocimientos del estudiante
- 📊 **Gráficos Interactivos** - Visualización del rendimiento semanal
- 🎯 **Metas y Objetivos** - Seguimiento de objetivos semanales

## 🏗️ Arquitectura del Sistema

```
cerebritos-app/
├── mobile-app/          # App móvil (React Native + Expo)
├── web-dashboard/       # Dashboard web (React + TypeScript)
├── firebase-functions/  # Backend (Firebase Functions)
├── scripts/            # Scripts de configuración
└── docs/              # Documentación
```

### Tecnologías Utilizadas
- **Frontend Móvil**: React Native, Expo, TypeScript
- **Frontend Web**: React, TypeScript, Recharts
- **Backend**: Firebase (Firestore, Authentication, Functions)
- **IA**: Google Gemini API + OpenAI API (intercambiables)
- **Hosting**: Firebase Hosting

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Git
- Expo CLI (`npm install -g @expo/cli`)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/ancolimodio/cerebritos-app.git
cd cerebritos-app
```

### 2. Configurar Variables de Entorno

> ⚠️ **IMPORTANTE**: Debes configurar las API keys antes de ejecutar la aplicación.

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` y agrega tus propias API keys:

#### Firebase (Requerido)
- Ve a [Firebase Console](https://console.firebase.google.com)
- Crea un nuevo proyecto
- Habilita Authentication y Firestore
- Copia las credenciales a `.env`

#### APIs de IA (Opcional - usa las incluidas o configura las tuyas)
- **Google Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey) - API gratuita
- **OpenAI**: [OpenAI API Keys](https://platform.openai.com/api-keys) - Requiere cuenta con créditos

```env
# Firebase Configuration (REQUERIDO)
FIREBASE_API_KEY=tu_firebase_api_key_aqui
FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu_proyecto_id

# AI APIs (OPCIONAL - ya incluidas en el código)
GEMINI_API_KEY=tu_gemini_api_key_aqui
OPENAI_API_KEY=tu_openai_api_key_aqui
```

> 💡 **Tip**: Si no configuras las APIs de IA, la aplicación usará las credenciales incluidas en el código.

### 3. Instalar Dependencias

#### App Móvil
```bash
cd mobile-app
npm install
```

#### Dashboard Web
```bash
cd web-dashboard
npm install
```

#### Firebase Functions
```bash
cd firebase-functions
npm install
```

### 3. Configuración Automática
El proyecto está preconfigurado con:
- ✅ **Firebase**: Base de datos y autenticación ya configuradas
- ✅ **IA Dual**: Google Gemini y OpenAI configurados y listos para usar
- ✅ **Datos de ejemplo**: Usuarios y contenido de prueba incluidos

No requiere configuración adicional.

## 🏃‍♂️ Ejecutar la Aplicación

### App Móvil (Desarrollo)
```bash
cd mobile-app
npm start
# o
expo start
```

Opciones para probar:
- **Expo Go**: Escanear QR con la app Expo Go
- **Simulador iOS**: Presionar `i`
- **Emulador Android**: Presionar `a`
- **Web**: Presionar `w`

### Dashboard Web (Desarrollo)
```bash
cd web-dashboard
npm start
```
Abrir http://localhost:3000

### Firebase Functions (Desarrollo)
```bash
cd firebase-functions
npm run serve
```

## 📦 Compilación para Producción

> 📱 **App Móvil**: Para uso personal, recomendamos probar con Expo Go

### App Móvil (Opcional)
```bash
cd mobile-app

# Para Android (APK) - requiere cuenta Expo
expo build:android

# Para iOS - requiere cuenta Apple Developer
expo build:ios
```

### Dashboard Web (Opcional)
```bash
cd web-dashboard
npm run build
```

> ⚠️ **Nota**: El deploy a producción requiere permisos del proyecto Firebase original.

## 🗄️ Estructura de la Base de Datos

### Colecciones Firestore
```
usuarios/
├── {userId}
    ├── email: string
    ├── perfil: { nombre, apellido, grado }
    ├── tipoUsuario: "estudiante" | "padre"
    └── gamificacion: { puntosTotal, nivelActual, diasRacha }

progresoTemas/
├── {progressId}
    ├── idUsuario: string
    ├── idMateria: string
    ├── idTema: string
    ├── puntaje: number
    ├── completado: boolean
    └── fechaCompletado: timestamp

insignias/
├── {badgeId}
    ├── idUsuario: string
    ├── tipo: string
    ├── nombre: string
    ├── descripcion: string
    └── fechaObtenida: timestamp

vinculosPadreHijo/
├── {linkId}
    ├── idPadre: string
    ├── idHijo: string
    ├── estado: "activo"
    └── fechaVinculacion: timestamp
```

## 👥 Cuentas de Prueba

> 🎆 **Listo para usar**: Las siguientes cuentas ya están creadas en la base de datos

### Estudiante
- **Email**: estudiante@cerebritos.com
- **Password**: estudiante123
- **Perfil**: Ana Estudiante, 5to Grado
- **Datos**: Incluye progreso en Matemáticas y Ciencias

### Padre
- **Email**: padre@cerebritos.com
- **Password**: padre123
- **Perfil**: Carlos Padre
- **Vinculación**: Ya conectado con la cuenta estudiante

### Funcionalidades Incluidas
- ✅ Cuestionarios completados
- ✅ Insignias obtenidas
- ✅ Progreso por materias
- ✅ Estadísticas de tiempo
- ✅ Vínculo padre-hijo activo

## 🔧 Scripts Útiles

### Configuración Inicial
```bash
# Ejecutar setup completo (opcional)
./scripts/setup.sh  # Linux/Mac
./scripts/setup.bat # Windows

# Cambiar agente de IA (Gemini ↔️ OpenAI)
./scripts/change-ai-engine.bat
```

> 📝 **Nota**: Los datos de ejemplo y vínculos ya están configurados en la base de datos.
> 🤖 **IA**: Por defecto usa Google Gemini, pero puedes cambiar a OpenAI con el script.

### Desarrollo
```bash
# Instalar todas las dependencias
npm run install:all

# Ejecutar todo en desarrollo
npm run dev:all

# Limpiar node_modules
npm run clean
```

## 🐛 Solución de Problemas

### Problemas Comunes

**Error de Firebase**: Las credenciales están preconfiguradas. Si hay problemas, verificar conexión a internet.

**Error de Expo**: Limpiar cache
```bash
expo r -c
```

**Error de dependencias**: Reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error de IA**: Las API keys de Gemini y OpenAI están incluidas. Si hay problemas, puede ser límite de uso diario.

## 📚 Documentación Adicional

- [Guía de Desarrollo](docs/development.md)
- [Configuración de Firebase](docs/firebase-setup.md) - 🔒 **Preconfigurado**
- [API de Gemini](docs/gemini-integration.md) - 🔒 **Preconfigurado**
- [Deployment](docs/deployment.md)



## 👨‍💻 Autor

**Alan Colimodio**  

