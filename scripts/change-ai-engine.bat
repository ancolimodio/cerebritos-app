@echo off
echo ========================================
echo    Configurador de Motor de IA
echo    Cerebritos App
echo ========================================
echo.

echo Motores disponibles:
echo 1. OpenAI GPT (Recomendado - Requiere API Key)
echo 2. Hugging Face (Gratuito - Capacidades basicas)
echo.

set /p choice="Selecciona el motor (1 o 2): "

if "%choice%"=="1" (
    echo AI_ENGINE=openai > ..\mobile-app\.env.local
    echo.
    echo ✅ Motor configurado: OpenAI GPT
    echo.
    echo ⚠️  IMPORTANTE: Asegurate de tener configurada tu OPENAI_API_KEY
    echo    en el archivo .env principal
) else if "%choice%"=="2" (
    echo AI_ENGINE=huggingface > ..\mobile-app\.env.local
    echo.
    echo ✅ Motor configurado: Hugging Face
    echo.
    echo ℹ️  Este motor es gratuito pero con capacidades limitadas
) else (
    echo ❌ Opcion invalida
    goto end
)

echo.
echo 🔄 Reinicia la aplicacion para aplicar los cambios
echo.

:end
pause