!macro CustomCodePostInstall
	CreateDirectory "$INSTDIR\App\Discord\app-0.0.306"
	CreateDirectory $INSTDIR\App\Discord\packages
	CopyFiles /SILENT "$INSTDIR\App\Discord\TempFolder\lib\net45\*" "$INSTDIR\App\Discord\app-0.0.306"
	Rename "$INSTDIR\App\AppInfo\discord.ico" "$INSTDIR\App\AppInfo\app.ico"
	Rename "$INSTDIR\App\AppInfo\app.ico" "$INSTDIR\App\Discord\app.ico"
	CopyFiles /SILENT "$INSTDIR\App\Discord\app.ico" "$INSTDIR\App\Discord\app-0.0.306"
	RMDir /r "$INSTDIR\App\Discord\TempFolder"
	execDos::exec `"$INSTDIR\7zTemp\7z.exe" x "$INSTDIR\App\Discord\app-0.0.306\resources\app.asar" -o"$INSTDIR\App\Discord\app-0.0.306\resources\app"`
	Pop $R0
	Delete "$INSTDIR\App\Discord\app-0.0.306\resources\app.asar"
	RMDir /r "$INSTDIR\7zTemp"
!macroend
