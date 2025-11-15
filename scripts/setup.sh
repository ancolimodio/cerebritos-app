#!/bin/bash

echo "🚀 Configurando Cerebritos App..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"
echo "✅ npm $(npm --version) detectado"

# Instalar Firebase CLI si no está instalado
if ! command -v firebase &> /dev/null; then
    echo "📦 Instalando Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI $(firebase --version) listo"

# Instalar dependencias del proyecto principal
echo "📦 Instalando dependencias principales..."
npm install

# Instalar dependencias de la app móvil
echo "📦 Instalando dependencias de la app móvil..."
cd mobile-app
npm install
cd ..

# Instalar dependencias del dashboard web
echo "📦 Instalando dependencias del dashboard web..."
cd web-dashboard
npm install
cd ..

# Instalar dependencias de Firebase Functions
echo "📦 Instalando dependencias de Firebase Functions..."
cd firebase-functions
npm install
cd ..

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura Firebase: firebase login && firebase init"
echo "2. Copia .env.example a .env y completa las variables"
echo "3. Ejecuta: npm run mobile:android (o ios)"
echo "4. Para el dashboard web: npm run web:dev"
echo "5. Para el backend local: npm run functions:serve"
echo ""
echo "📖 Lee la documentación completa en docs/setup-guide.md"