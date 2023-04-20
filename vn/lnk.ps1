# with utf-8 BOM

$_LINK = $args[0]
$_TARGET = $args[1]

$WShell = New-Object -comObject WScript.Shell
$Shortcut = $WShell.CreateShortcut($_LINK)
$Shortcut.TargetPath = $_TARGET
$Shortcut.Save()
