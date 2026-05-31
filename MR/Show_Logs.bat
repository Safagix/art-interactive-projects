@echo off
echo --- LOGCAT CODICE (GODOT) ---
"adb" logcat -c
"adb" logcat -s godot:V
pause
