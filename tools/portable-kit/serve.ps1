# Fallback if server.exe is blocked. Prefer START-WINDOWS.bat.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

$mimes = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".mjs"  = "text/javascript; charset=utf-8"
  ".json" = "application/json"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".webp" = "image/webp"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
  ".pdf"  = "application/pdf"
  ".mp4"  = "video/mp4"
  ".txt"  = "text/plain; charset=utf-8"
  ".ico"  = "image/x-icon"
}

$listener = $null
$port = 0
foreach ($tryPort in 8000, 8765, 5500, 9000, 18000) {
  try {
    $candidate = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback, $tryPort)
    $candidate.Start()
    $listener = $candidate
    $port = $tryPort
    break
  } catch { }
}

if (-not $listener) {
  Write-Host "Could not start a local server. Close other copies of this site and try again."
  Read-Host "Press Enter to close"
  exit 1
}

$url = "http://127.0.0.1:$port/"
Write-Host ""
Write-Host "  Jaco & Anuscha portfolio is running."
Write-Host "  $url"
Write-Host "  Keep this window open while you show the site."
Write-Host ""
try { Start-Process $url | Out-Null } catch { Write-Host "Open this address in your browser: $url" }

$utf8 = [Text.Encoding]::UTF8
$ascii = [Text.Encoding]::ASCII

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $client.NoDelay = $true
    $stream = $client.GetStream()
    $stream.ReadTimeout = 8000
    $buf = New-Object byte[] 4096
    $ms = New-Object IO.MemoryStream
    $reqText = ""
    while ($ms.Length -lt 32768) {
      $n = $stream.Read($buf, 0, $buf.Length)
      if ($n -le 0) { break }
      $ms.Write($buf, 0, $n)
      $reqText = $ascii.GetString($ms.ToArray())
      if ($reqText.Contains("`r`n`r`n")) { break }
    }
    if (-not $reqText) { $client.Close(); continue }
    $line = ($reqText -split "`r`n")[0]
    $parts = $line -split " "
    $pathUrl = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
    if ($pathUrl.Contains("?")) { $pathUrl = $pathUrl.Split("?")[0] }
    $pathUrl = [Uri]::UnescapeDataString($pathUrl)
    if ($pathUrl -eq "/") { $pathUrl = "/index.html" }
    $rel = $pathUrl.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
    if ($rel.Contains("..")) { $client.Close(); continue }
    $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
    $rootFull = [IO.Path]::GetFullPath($root)
    if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) { $client.Close(); continue }
    if (Test-Path -LiteralPath $full -PathType Container) { $full = Join-Path $full "index.html" }
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
      $body = $utf8.GetBytes("Not found")
      $head = $ascii.GetBytes("HTTP/1.1 404 Not found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n")
      $stream.Write($head, 0, $head.Length)
      $stream.Write($body, 0, $body.Length)
    } else {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
      $mime = if ($mimes.ContainsKey($ext)) { $mimes[$ext] } else { "application/octet-stream" }
      $head = $ascii.GetBytes("HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`n`r`n")
      $stream.Write($head, 0, $head.Length)
      $stream.Write($bytes, 0, $bytes.Length)
    }
  } catch {
  } finally {
    try { $client.Close() } catch { }
  }
}
