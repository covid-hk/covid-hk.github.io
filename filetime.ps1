# # Run PowerShell as Admin
# Set-ExecutionPolicy RemoteSigned

$filetimecsvfilename = "filetime.csv"
$filetimecsvfilepath = Join-Path $PSScriptRoot $filetimecsvfilename

$waitToCallGoogleApisMaps = $false

if (![System.IO.File]::Exists($filetimecsvfilepath)) {
  # filetime.csv init
  Set-Content -Path $filetimecsvfilepath -Value "file_time,file_name,file_md5" -Force
  $files = @()
  $files = Get-ChildItem -Path $PSScriptRoot -Recurse -File -Filter *.csv
  $files |`
  Foreach-Object {
    $filename = $_.Name
    $filepath = $_.FullName
    $filetime = $_.LastWriteTime.ToLocalTime().ToString("yyyy-MM-ddTHH:mm:ss")
    if (-NOT ($filename -eq $filetimecsvfilename)) {
      $md5 = (Get-FileHash $filepath -Algorithm MD5).Hash
      Add-Content -Path $filetimecsvfilepath -Value $filetime","$filename","$md5 -Force
    }
  }
}
else {
  # filetime.csv update
  $file_time = @()
  $file_name = @()
  $file_md5 = @()
  Import-Csv $filetimecsvfilepath |`
  ForEach-Object {
    $filename = $_."file_name"
    $filepath = Join-Path $PSScriptRoot $filename
    $filetime = $_."file_time"
    $filemd5 = $_."file_md5"
    if (-NOT ($filename -eq $filetimecsvfilename)) {
      $md5 = (Get-FileHash $filepath -Algorithm MD5).Hash
      if (-NOT ($md5 -eq $_."file_md5")) {
        $filetime = (Get-Item $filepath).LastWriteTime.ToLocalTime().ToString("yyyy-MM-ddTHH:mm:ss")
        $filename = $_."file_name"
        $filemd5 = $md5
        if ($filename -eq "building_list_chi.csv" -OR $filename -eq "googleapis_maps.csv") {
          $waitToCallGoogleApisMaps = $true
        }
      }
      $file_time += $filetime
      $file_name += $filename
      $file_md5 += $filemd5
    }
  }
  Set-Content -Path $filetimecsvfilepath -Value "file_time,file_name,file_md5" -Force
  for ($i = 0; $i -lt $file_md5.Count; $i++) {
    Add-Content -Path $filetimecsvfilepath -Value "$($file_time[$i]),$($file_name[$i]),$($file_md5[$i])" -Force
  }
}

if ($waitToCallGoogleApisMaps -eq $true) {
  & .\googleapis_maps.ps1
}
