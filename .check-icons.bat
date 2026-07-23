@echo off
for %%n in (box container database server brain palette music layers terminal code-2 file-code package code xml) do (
  set FILE=C:\tss\dev-app\node_modules\lucide-react\dist\esm\icons\%%n.js
  if exist "!FILE!" echo YES %%n.js
  if not exist "!FILE!" echo NO  %%n.js
)
