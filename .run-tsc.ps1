Set-Location 'C:\tss\dev-app'
$out = & npx.cmd tsc -b --pretty 2>&1 | Out-String
$out | Out-File -FilePath 'C:\tss\.tsc-out.log' -Encoding utf8
"EXIT=$LASTEXITCODE"
