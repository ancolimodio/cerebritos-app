@echo off
echo 🚀 Configurando Cerebritos App...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js %NODE_VERSION% detectado
echo ✅ npm %NPM_VERSION% detectado

REM Verificar Firebase CLI
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando Firebase CLI...
    npm install -g firebase-tools
)

for /f "tokens=*" %%i in ('firebase --version') do set FIREBASE_VERSION=%%i
echo ✅ Firebase CLI %FIREBASE_VERSION% listo

REM Instalar dependencias del proyecto principal
echo 📦 Instalando dependencias principales...
npm install

REM Instalar dependencias de la app móvil
echo 📦 Instalando dependencias de la app móvil...
cd mobile-app
npm install
cd ..

REM Instalar dependencias del dashboard web
echo 📦 Instalando dependencias del dashboard web...
cd web-dashboard
npm install
cd ..

REM Instalar dependencias de Firebase Functions
echo 📦 Instalando dependencias de Firebase Functions...
cd firebase-functions
npm install
cd ..

echo.
echo 🎉 ¡Configuración completada!
echo.
echo 📋 Próximos pasos:
echo 1. Configura Firebase: firebase login ^&^& firebase init
echo 2. Copia .env.example a .env y completa las variables
echo 3. Ejecuta: npm run mobile:android
echo 4. Para el dashboard web: npm run web:dev
echo 5. Para el backend local: npm run functions:serve
echo.
echo 📖 Lee la documentación completa en docs\setup-guide.md
pause