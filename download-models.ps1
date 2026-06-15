$Base = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1"
$Files = @("face_landmarker.task")

$Dest = Join-Path $PSScriptRoot "public/models"
New-Item -ItemType Directory -Path $Dest -Force | Out-Null

foreach ($File in $Files) {
    $Url = "$Base/$File"
    $Out = Join-Path $Dest $File
    Write-Host "Descargando $File..."
    Invoke-WebRequest -Uri $Url -OutFile $Out -UseBasicParsing
}

Write-Host "Modelos descargados en: $Dest"
