@echo off
setlocal

cd /d "%~dp0"

echo ==============================================
echo   StockFlow B2B - Installation Automatique
echo ==============================================
echo.

echo [1/6] Configuration des fichiers .env...
copy /Y "backend-api\.env.example" "backend-api\.env" >nul
if errorlevel 1 (
  echo Erreur: impossible de copier backend-api\.env.example
  pause
  exit /b 1
)

copy /Y "frontend-react\.env.example" "frontend-react\.env" >nul
if errorlevel 1 (
  echo Erreur: impossible de copier frontend-react\.env.example
  pause
  exit /b 1
)

echo [2/6] Lancement de l'infrastructure Docker...
docker compose up -d --build
if errorlevel 1 (
  echo Erreur: echec de docker compose up -d --build
  pause
  exit /b 1
)

echo [3/6] Temporisation 15 secondes pour initialiser la base...
timeout /t 15 /nobreak >nul

echo [4/6] Initialisation base de donnees (migrate:fresh --seed)...
docker compose exec backend php artisan migrate:fresh --seed
if errorlevel 1 (
  echo Erreur: echec des migrations/seeders
  pause
  exit /b 1
)

echo [5/6] Installation du modele IA llama3.2:1b...
echo IMPORTANT: Quand le prompt ^>^>^> apparait, tapez /bye puis Entree.
docker compose exec ollama ollama run llama3.2:1b
if errorlevel 1 (
  echo Erreur: echec installation modele Ollama
  pause
  exit /b 1
)

echo.
echo [6/6] Installation terminee avec succes !
echo Application disponible sur: http://localhost:3000
echo.
pause
exit /b 0
