# Guarda una clave en .env.local sin mostrarla en pantalla ni pasarla por el chat.
# Uso: & '.\design\herramientas\poner-clave.ps1' NOMBRE_DE_LA_VARIABLE
param([Parameter(Mandatory = $true)][string]$Nombre)

$archivo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\.env.local'))
Write-Host ""
Write-Host "Pega la clave para $Nombre y presiona Enter (no se va a ver mientras la pegas):"
$segura = Read-Host -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura)
try { $valor = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr).Trim() }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }

if ([string]::IsNullOrEmpty($valor)) { Write-Host "No llegó nada. No cambié el archivo."; exit 1 }

$lineas = @()
if (Test-Path $archivo) { $lineas = @([IO.File]::ReadAllLines($archivo)) }
$nueva = "$Nombre=$valor"
$habia = $false
$lineas = @($lineas | ForEach-Object { if ($_ -match "^$([regex]::Escape($Nombre))=") { $habia = $true; $nueva } else { $_ } })
if (-not $habia) { $lineas += $nueva }
[IO.File]::WriteAllLines($archivo, [string[]]$lineas, (New-Object Text.UTF8Encoding($false)))
$valor = $null

if ($habia) { $accion = "reemplacé" } else { $accion = "agregué" }
Write-Host ""
Write-Host "Listo: $accion $Nombre en .env.local. Ya puedes cerrar esta pestaña."
