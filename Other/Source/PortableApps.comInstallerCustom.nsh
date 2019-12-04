!macro CustomCodePostInstall
	CreateDirectory "$INSTDIR\App\Discord\app-0.0.305"
	CreateDirectory $INSTDIR\App\Discord\packages
	CopyFiles /SILENT "$INSTDIR\App\Discord\TempFolder\lib\net45\*" "$INSTDIR\App\Discord\app-0.0.305"
	Rename "$INSTDIR\App\Discord\discord.ico" "$INSTDIR\App\Discord\app.ico"
	CopyFiles /SILENT "$INSTDIR\App\Discord\app.ico" "$INSTDIR\App\Discord\app-0.0.305"
	RMDir /r "$INSTDIR\App\Discord\TempFolder"
	execDos::exec `"$INSTDIR\App\_bin\7z.exe" x "$INSTDIR\App\Discord\app-0.0.305\resources\app.asar" -o"$INSTDIR\App\Discord\app-0.0.305\resources\app"`
	Pop $R0
	Delete "$INSTDIR\App\Discord\app-0.0.305\resources\app.asar"
	RMDir /r "$INSTDIR\App\_bin"
!macroend
