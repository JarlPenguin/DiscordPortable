${SegmentFile}

${SegmentPre}
	${IfNot} ${FileExists} "$EXEDIR\Data\Discord\settings.json"
		${IfNot} ${FileExists} "$EXEDIR\Data\*.*"
			CreateDirectory "$EXEDIR\Data"
		${EndIf}
		${IfNot} ${FileExists} "$EXEDIR\Data\Discord\*.*"
			CreateDirectory "$EXEDIR\Data\Discord"
		${EndIf}
		CopyFiles /SILENT "$EXEDIR\App\DefaultData\Discord\settings.json" "$EXEDIR\Data\Discord"
	${EndIf}
	${If} ${FileExists} "$EXEDIR\App\Discord\Update.exe"
		Rename "$EXEDIR\App\Discord\Update.exe" "$EXEDIR\App\Discord\Update.exe-Disabled"
	${EndIf}
!macroend
${SegmentPost}
	${If} ${FileExists} "$EXEDIR\App\Discord\Update.exe-Disabled"
		Rename "$EXEDIR\App\Discord\Update.exe-Disabled" "$EXEDIR\App\Discord\Update.exe"
	${EndIf}
!macroend
