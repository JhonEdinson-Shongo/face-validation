$Base = "https://github.com/justadudewhohacks/face-api.js/raw/master/weights"
$Models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1"
)

$Dest = Join-Path $PSScriptRoot "public/models"
New-Item -ItemType Directory -Path $Dest -Force | Out-Null

foreach ($File in $Models) {
    $Url = "$Base/$File"
    $Out = Join-Path $Dest $File
    Write-Host "Descargando $File..."
    Invoke-WebRequest -Uri $Url -OutFile $Out -UseBasicParsing
}

Write-Host "Modelos descargados en: $Dest"
