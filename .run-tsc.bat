@echo off
cd /d C:\tss\dev-app
node node_modules\typescript\bin\tsc -b --pretty > C:\tss\.tsc-out2.log 2>&1
echo DONE=%errorlevel%
