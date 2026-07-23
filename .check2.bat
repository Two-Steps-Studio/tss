@echo off
setlocal
set FOUND=
for %%F in (C:\tss\dev-app\node_modules\lucide-react\dist\esm\icons\*-icon.js) do set FOUND=%%F
if defined FOUND echo Found: %FOUND%
echo --- try dot variants ---
for %%F in (C:\tss\dev-app\node_modules\lucide-react\dist\esm\icons\box*.js) do @echo %%F
