# 🚀 Guía de Configuración Completa - Cerebritos

## 📋 Prerrequisitos

### 1. Instalar Node.js
- Descargar desde [nodejs.org](https://nodejs.org/) (versión 18 LTS)
- Verificar instalación: `node --version` y `npm --version`

### 2. Instalar Git
- Descargar desde [git-scm.com](https://git-scm.com/)
- Configurar: `git config --global user.name "Tu Nombre"`

### 3. Instalar Android Studio (para desarrollo Android)
- Descargar desde [developer.android.com](https://developer.android.com/studio)
- Instalar Android SDK y crear AVD (Android Virtual Device)

### 4. Instalar Xcode (solo macOS, para iOS)
- Instalar desde Mac App Store
- Instalar Command Line Tools: `xcode-select --install`

## 🔥 Configuración de Firebase

### Paso 1: Crear proyecto Firebase
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Hacer clic en "Crear un proyecto"
3. Nombre del proyecto: `cerebritos-app`
4. Habilitar Google Analytics (opcional)
5. Crear proyecto

### Paso 2: Configurar Authentication
1. En el panel izquierdo, ir a "Authentication"
2. Hacer clic en "Comenzar"
3. En la pestaña "Sign-in method", habilitar:
   - Email/Password
   - Google (opcional)

### Paso 3: Configurar Firestore Database
1. Ir a "Firestore Database"
2. Hacer clic en "Crear base de datos"
3. Seleccionar "Comenzar en modo de prueba"
4. Elegir ubicación (us-central1 recomendado)

### Paso 4: Configurar Functions
1. Ir a "Functions"
2. Hacer clic en "Comenzar"
3. Actualizar plan a Blaze (necesario para APIs externas)

### Paso 5: Configurar aplicaciones
1. En "Configuración del proyecto", agregar aplicación:
   - **Android**: Paquete `com.cerebritos.app`
   - **iOS**: Bundle ID `com.cerebritos.app`
   - **Web**: Dominio localhost

2. Descargar archivos de configuración:
   - `google-services.json` → `mobile-app/android/app/`
   - `GoogleService-Info.plist` → `mobile-app/ios/`
   - Copiar config web para `.env`

## 🤖 Configuración de OpenAI

### Paso 1: Crear cuenta OpenAI
1. Ir a [platform.openai.com](https://platform.openai.com)
2. Crear cuenta o iniciar sesión
3. Verificar número de teléfono

### Paso 2: Generar API Key
1. Ir a "API Keys" en el dashboard
2. Hacer clic en "Create new secret key"
3. Copiar la clave (solo se muestra una vez)
4. Agregar a archivo `.env`

### Paso 3: Configurar límites (opcional)
1. Ir a "Usage limits"
2. Establecer límite mensual ($5-10 recomendado para desarrollo)

## 🛠️ Configuración del Proyecto

### Paso 1: Clonar y configurar
```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd cerebritos-app

# Copiar variables de entorno
cp .env.example .env
```

### Paso 2: Editar archivo .env
```bash
# Abrir .env y completar con tus datos:
FIREBASE_API_KEY=tu_api_key_de_firebase
FIREBASE_PROJECT_ID=cerebritos-app
OPENAI_API_KEY=tu_api_key_de_openai
```

### Paso 3: Instalar dependencias
```bash
npm run install-all
```

### Paso 4: Configurar Firebase CLI
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto
firebase init
```

Seleccionar:
- ✅ Functions
- ✅ Firestore
- ✅ Hosting
- Proyecto existente: `cerebritos-app`

## 📱 Ejecutar la Aplicación

### App Móvil (React Native)
```bash
# Android
npm run mobile:android

# iOS (solo macOS)
npm run mobile:ios
```

### Dashboard Web
```bash
npm run web:dev
```

### Backend Local
```bash
npm run functions:serve
```

## 🔧 Solución de Problemas Comunes

### Error: "Command not found: react-native"
```bash
npm install -g @react-native-community/cli
```

### Error: Android SDK no encontrado
1. Abrir Android Studio
2. SDK Manager → Install Android SDK
3. Agregar a PATH: `export ANDROID_HOME=$HOME/Android/Sdk`

### Error: Firebase Functions timeout
1. Verificar que el plan sea Blaze
2. Aumentar timeout en `firebase.json`

### Error: OpenAI API rate limit
1. Verificar límites en dashboard OpenAI
2. Implementar retry logic en el código

## ✅ Verificación de Instalación

Ejecutar estos comandos para verificar que todo esté configurado:

```bash
# Verificar Node.js
node --version

# Verificar React Native
npx react-native --version

# Verificar Firebase CLI
firebase --version

# Verificar conexión a Firebase
firebase projects:list

# Probar OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

## 🚀 Siguiente Paso

Una vez completada la configuración, continuar con la [Guía de Desarrollo](./development.md).