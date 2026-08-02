; NSIS Custom Installer Script for Two Steps Studio Desktop
; Language: Polish (1045)

!macro preInit
  SetRegView 64
  ${If} ${RunningX64}
    ; Running on 64-bit Windows
  ${Else}
    ; Running on 32-bit Windows - not supported
    MessageBox MB_OK|MB_ICONSTOP "Two Steps Studio wymaga system Windows 64-bit. Proszę pobrać odpowiednią wersję." /SD IDOK
    Quit
  ${EndIf}
  SetRegView 32
!macroend

; Custom pages
!macro customInstall
  ; Create additional shortcuts
  CreateShortCut "$SMPROGRAMS\Two Steps Studio\Strona internetowa.lnk" "https://twostepsstudio.com"
  CreateShortCut "$SMPROGRAMS\Two Steps Studio\Pomoc techniczna.lnk" "https://twostepsstudio.com/kontakt"
  
  ; Register for auto-start if user selected
  ${If} $AutoStart == "1"
    CreateShortCut "$SMSTARTUP\Two Steps Studio.lnk" "$INSTDIR\Two Steps Studio.exe"
  ${EndIf}
!macroend

!macro customUnInstall
  ; Remove custom shortcuts
  Delete "$SMPROGRAMS\Two Steps Studio\Strona internetowa.lnk"
  Delete "$SMPROGRAMS\Two Steps Studio\Pomoc techniczna.lnk"
  Delete "$SMSTARTUP\Two Steps Studio.lnk"
  
  ; Clean up registry keys
  DeleteRegKey HKLM "Software\Two Steps Studio"
  DeleteRegKey HKCU "Software\Two Steps Studio"
!macroend

; Variables for custom UI
Var AutoStart
Var CreateDesktopIcon
Var CreateStartMenuIcon

; Custom page functions
Function .onInit
  ; Check Windows version
  ${If} ${IsWin10}
    ; Windows 10 or later - OK
  ${ElseIf} ${IsWin8}
    ; Windows 8 - OK but warn
    MessageBox MB_OK|MB_ICONINFORMATION "Zalecamy Windows 10 lub nowszy dla najlepszej wydajności." /SD IDOK
  ${Else}
    ; Windows 7 or earlier - not supported
    MessageBox MB_OK|MB_ICONSTOP "Two Steps Studio wymaga system Windows 10 lub nowszy." /SD IDOK
    Quit
  ${EndIf}
  
  ; Set default values
  StrCpy $AutoStart "0"
  StrCpy $CreateDesktopIcon "1"
  StrCpy $CreateStartMenuIcon "1"
FunctionEnd

Function CustomPage
  !insertmacro MUI_HEADER_TEXT "Opcje dodatkowe" "Wybierz dodatkowe opcje instalacji"
  
  nsDialogs::Create 1018
  Pop $0
  
  ${NSD_CreateLabel} 0 0 100% 12u "Wybierz dodatkowe opcje:"
  Pop $1
  
  ${NSD_CreateCheckBox} 0 20u 100% 10u "Uruchamiaj automatycznie przy starcie Windows"
  Pop $2
  ${NSD_SetState} $2 $AutoStart
  ${NSD_OnClick} $2 AutoStartChange
  
  ${NSD_CreateCheckBox} 0 35u 100% 10u "Utwórz skrót na pulpicie"
  Pop $3
  ${NSD_SetState} $3 $CreateDesktopIcon
  ${NSD_OnClick} $3 DesktopIconChange
  
  ${NSD_CreateCheckBox} 0 50u 100% 10u "Utwórz skrót w Menu Start"
  Pop $4
  ${NSD_SetState} $4 $CreateStartMenuIcon
  ${NSD_OnClick} $4 StartMenuIconChange
  
  nsDialogs::Show
FunctionEnd

Function AutoStartChange
  Pop $0
  ${NSD_GetState} $2 $AutoStart
FunctionEnd

Function DesktopIconChange
  Pop $0
  ${NSD_GetState} $3 $CreateDesktopIcon
FunctionEnd

Function StartMenuIconChange
  Pop $0
  ${NSD_GetState} $4 $CreateStartMenuIcon
FunctionEnd

Function leaveCustomPage
  ; Validate selections
  ${If} $CreateDesktopIcon == "1"
    CreateShortCut "$DESKTOP\Two Steps Studio.lnk" "$INSTDIR\Two Steps Studio.exe"
  ${EndIf}
  
  ${If} $CreateStartMenuIcon == "1"
    CreateDirectory "$SMPROGRAMS\Two Steps Studio"
    CreateShortCut "$SMPROGRAMS\Two Steps Studio\Two Steps Studio.lnk" "$INSTDIR\Two Steps Studio.exe"
  ${EndIf}
FunctionEnd
