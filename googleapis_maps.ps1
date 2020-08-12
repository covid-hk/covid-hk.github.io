# https://developers.google.com/places/web-service/search
# https://developers.google.com/maps/documentation/javascript/places

# # Run PowerShell as Admin
# Set-ExecutionPolicy RemoteSigned

$YOUR_API_KEY = "AIzaSyBFdKwKnb0S8VsiHkXzgvEGgkToBQYT6jA"

function getLatLongFromGoogleMapApi($district, $building) {
  $api_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" + $district + "+" + $building + "&inputtype=textquery&fields=name,geometry&key=" + $YOUR_API_KEY
  # # Returns http%3A%2F%2Ftest.com%3Ftest%3Dmy%20value
  # [uri]::EscapeDataString("http://test.com?test=my value")
  # # Returns http://test.com?test=my%20value
  # [uri]::EscapeUriString("http://test.com?test=my value")
  $api_url = [uri]::EscapeUriString($api_url)

  #$json = Invoke-RestMethod -Uri $api_url
  #$data = $json | ConvertFrom-Json
  $response = Invoke-RestMethod -Uri $api_url
  $candidates = $response.candidates
  $status = $response.status
  if ($status -eq "OK") {
    if ($candidates.Count -gt 0) {
      $googlename = $candidates[0].name;
      $geometry = $candidates[0].geometry.location;
      $lat = $geometry.lat;
      $lng = $geometry.lng;
      #Write-Host "$district,$building,$googlename,$lat,$lng,OK"
      return New-Object -TypeName PSObject -Property @{status = $status; name = $googlename; lat = $lat; lng = $lng}
    }
  }
  elseif ($status -eq "INVALID_REQUEST") {
    #Write-Host "$district,$building,INVALID_REQUEST"
  }
  elseif ($status -eq "OVER_QUERY_LIMIT") {
    #Write-Host "$district,$building,OVER_QUERY_LIMIT"
  }
  elseif ($status -eq "REQUEST_DENIED") {
    #Write-Host "$district,$building,REQUEST_DENIED"
  }
  elseif ($status -eq "UNKNOWN_ERROR") {
    #Write-Host "$district,$building,UNKNOWN_ERROR"
  }
  elseif ($status -eq "ZERO_RESULTS") {
    #Write-Host "$district,$building,ZERO_RESULTS"
  }
  return New-Object -TypeName PSObject -Property @{status = $status}
}

function convertToGoogleApisMapsHashmap($array) {
  $hashmap = New-Object System.Collections.Hashtable # @{}
  $array | foreach { $hashmap[$_.地區 + "," + $_.大廈名單] = $_ }
  return $hashmap
}

$building_list_chi = @()
$filepath = Join-Path $PSScriptRoot "building_list_chi.csv"
Import-Csv $filepath |
ForEach-Object {
  $district = $_.地區
  $building = $_.大廈名單.replace(' (非住宅)', '')

  # Data bug, special handling temporarily
  if ($false) { }
  elseif ($district.StartsWith('九龍城')) { $district = '九龍城'; }
  elseif ($building.StartsWith('加州花園')) { $district = '元朗'; }
  elseif ($building.StartsWith('天富苑')) { $district = '元朗'; }
  elseif ($building.StartsWith('天恒邨')) { $district = '元朗'; }
  elseif ($building.StartsWith('天澤邨')) { $district = '元朗'; }
  elseif ($building.StartsWith('寶達邨')) { $district = '觀塘'; }
  elseif ($building.StartsWith('愛民邨')) { $district = '九龍城'; }
  elseif ($building.StartsWith('樂華(北)邨')) { $district = '觀塘'; }
  elseif ($building.StartsWith('深圳灣')) { $district = '元朗'; }
  elseif ($building.StartsWith('白田')) { $district = '深水埗'; }
  elseif ($building.StartsWith('石籬')) { $district = '葵青'; }
  elseif ($building.StartsWith('華心邨')) { $district = '北區'; }
  elseif ($building.StartsWith('藍地綠怡居')) { $district = '屯門'; }

  $building_list_chi += New-Object -TypeName PSObject -Property @{地區 = $district; 大廈名單 = $building}
}
$building_list_chi = $building_list_chi | Sort-Object -Property 地區,大廈名單 # | Get-Unique –AsString

$googleapis_maps = @()
$filepath = Join-Path $PSScriptRoot "googleapis_maps.csv"
Import-Csv $filepath |
ForEach-Object {
  $district = $_.地區
  $building = $_.大廈名單
  $googlename = $_.name
  $lat = $_.lat
  $lng = $_.lng
  $googleapis_maps += New-Object -TypeName PSObject -Property @{地區 = $district; 大廈名單 = $building; name = $googlename; lat = $lat; lng = $lng}
}
$googleapis_maps = $googleapis_maps | Sort-Object -Property 地區,大廈名單 # | Get-Unique –AsString
$googleapis_maps_hashmap = convertToGoogleApisMapsHashmap $googleapis_maps

$results = @()
foreach ($key in $googleapis_maps_hashmap.Keys) {
  $value = $googleapis_maps_hashmap.$key
  $results += New-Object -TypeName PSObject -Property @{地區 = $value.地區; 大廈名單 = $value.大廈名單; name = $value.name; lat = $value.lat; lng = $value.lng}
}
$building_list_chi |
ForEach-Object {
  $key = $_.地區 + "," + $_.大廈名單
  if (!$googleapis_maps_hashmap.ContainsKey($key)) {
    $data = getLatLongFromGoogleMapApi $_.地區 $_.大廈名單
    if ($data.status -eq "OK") {
      $googlename = $data.name;
      $lat = $data.lat;
      $lng = $data.lng;
      $value = New-Object -TypeName PSObject -Property @{地區 = $_.地區; 大廈名單 = $_.大廈名單; name = $googlename; lat = $lat; lng = $lng}
      $results += New-Object -TypeName PSObject -Property @{地區 = $value.地區; 大廈名單 = $value.大廈名單; name = $value.name; lat = $value.lat; lng = $value.lng}
      $googleapis_maps_hashmap.Set_Item($key, $value)
      Start-Sleep -Seconds 2.0
    }
  }
}
$results = $results | Sort-Object -Property 地區,大廈名單 # | Get-Unique –AsString

$filepath = Join-Path $PSScriptRoot "googleapis_maps_copy.csv"
#$results |
#ForEach-Object {
#  Write-Host "$($_.地區),$($_.大廈名單),$($_.name),$($_.lat),$($_.lng)"
#}
$results | Select-Object 地區,大廈名單,name,lat,lng | Export-Csv -Encoding UTF8 -NoTypeInformation -Path "$filepath"
