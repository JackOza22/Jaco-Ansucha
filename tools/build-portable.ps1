$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "project"
$dest = Join-Path $root "portable\Jaco-and-Anuscha-Portfolio"

if (Test-Path $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Copy the live site (skip authoring notes)
$exclude = @("_source", ".git")
Get-ChildItem -LiteralPath $src -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $dest $_.Name) -Recurse -Force
}

$vendor = Join-Path $dest "vendor"
$threeAddons = Join-Path $vendor "three\addons"
New-Item -ItemType Directory -Force -Path (Join-Path $threeAddons "renderers") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $threeAddons "controls") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $threeAddons "postprocessing") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $threeAddons "shaders") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $vendor "fonts") | Out-Null

$downloads = @{
  (Join-Path $vendor "gsap.min.js") = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js"
  (Join-Path $vendor "lenis.min.js") = "https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"
  (Join-Path $vendor "three\three.module.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
  (Join-Path $threeAddons "renderers\CSS2DRenderer.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/renderers/CSS2DRenderer.js"
  (Join-Path $threeAddons "controls\OrbitControls.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"
  (Join-Path $threeAddons "postprocessing\EffectComposer.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js"
  (Join-Path $threeAddons "postprocessing\RenderPass.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js"
  (Join-Path $threeAddons "postprocessing\UnrealBloomPass.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js"
  (Join-Path $threeAddons "postprocessing\Pass.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/Pass.js"
  (Join-Path $threeAddons "postprocessing\ShaderPass.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js"
  (Join-Path $threeAddons "postprocessing\MaskPass.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/MaskPass.js"
  (Join-Path $threeAddons "shaders\CopyShader.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/shaders/CopyShader.js"
  (Join-Path $threeAddons "shaders\LuminosityHighPassShader.js") = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/shaders/LuminosityHighPassShader.js"
  (Join-Path $vendor "fonts\ibm-plex-sans-400.woff2") = "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@5.2.5/latin-400-normal.woff2"
  (Join-Path $vendor "fonts\ibm-plex-sans-500.woff2") = "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@5.2.5/latin-500-normal.woff2"
  (Join-Path $vendor "fonts\ibm-plex-sans-600.woff2") = "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@5.2.5/latin-600-normal.woff2"
  (Join-Path $vendor "fonts\fraunces-400.woff2") = "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@5.2.5/latin-400-normal.woff2"
  (Join-Path $vendor "fonts\fraunces-500.woff2") = "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@5.2.5/latin-500-normal.woff2"
  (Join-Path $vendor "fonts\fraunces-600.woff2") = "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@5.2.5/latin-600-normal.woff2"
  (Join-Path $vendor "fonts\fraunces-700.woff2") = "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@5.2.5/latin-700-normal.woff2"
}

foreach ($pair in $downloads.GetEnumerator()) {
  Write-Host "GET $($pair.Value)"
  Invoke-WebRequest -Uri $pair.Value -OutFile $pair.Key -UseBasicParsing
}

$kit = Join-Path $root "tools\portable-kit"
Copy-Item -LiteralPath (Join-Path $kit "*") -Destination $dest -Force
$fontsCss = Join-Path $dest "css\fonts.css"
if (Test-Path (Join-Path $kit "fonts.css")) {
  Copy-Item -LiteralPath (Join-Path $kit "fonts.css") -Destination $fontsCss -Force
}

$htmlPath = Join-Path $dest "index.html"
$html = Get-Content -LiteralPath $htmlPath -Raw -Encoding UTF8
$html = $html -replace '(?s)<link rel="preconnect" href="https://fonts\.googleapis\.com">.*?<link href="https://fonts\.googleapis\.com/css2\?[^"]+" rel="stylesheet">', '<link rel="stylesheet" href="css/fonts.css">'
$html = $html -replace 'href="css/(style|cinematic)\.css\?v=\d+"', 'href="css/$1.css"'
$html = $html -replace 'src="https://cdn\.jsdelivr\.net/npm/gsap@[^"]+"', 'src="vendor/gsap.min.js"'
$html = $html -replace 'src="https://cdn\.jsdelivr\.net/npm/lenis@[^"]+"', 'src="vendor/lenis.min.js"'
$html = $html -replace 'https://cdn\.jsdelivr\.net/npm/three@0\.160\.0/build/three\.module\.js', './vendor/three/three.module.js'
$html = $html -replace 'https://cdn\.jsdelivr\.net/npm/three@0\.160\.0/examples/jsm/', './vendor/three/addons/'
$html = $html -replace 'src="js/(content|main)\.js\?v=\d+"', 'src="js/$1.js"'
Set-Content -LiteralPath $htmlPath -Value $html -Encoding UTF8

$csc = Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) { $csc = Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe" }
if (-not (Test-Path $csc)) { throw "csc.exe not found — cannot build server.exe" }
Push-Location $dest
& $csc /nologo /t:exe /out:"server.exe" "server.cs"
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "server.exe compile failed" }
Copy-Item -LiteralPath "server.exe" -Destination "Jaco-and-Anuscha.exe" -Force
Pop-Location

Write-Host "Portable files copied to $dest"
Write-Host "Bytes:" ((Get-ChildItem -LiteralPath $dest -Recurse -File | Measure-Object Length -Sum).Sum)
