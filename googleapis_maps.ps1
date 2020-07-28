# https://developers.google.com/places/web-service/search
# https://developers.google.com/maps/documentation/javascript/places

# # Run PowerShell as Admin
# Set-ExecutionPolicy RemoteSigned

$districts = @()
$buildings = @()

$filepath = Join-Path $PSScriptRoot "building_list_chi.csv"
Import-Csv $filepath |`
ForEach-Object {
  $districts += $_."地區"
  $buildings += $_."大廈名單"
}

$YOUR_API_KEY = ""

$api_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" + $buildings[0] + " " + $districts[0] + "&inputtype=textquery&fields=geometry&key=" + $YOUR_API_KEY
# # Returns http%3A%2F%2Ftest.com%3Ftest%3Dmy%20value
# [uri]::EscapeDataString("http://test.com?test=my value")
# # Returns http://test.com?test=my%20value
# [uri]::EscapeUriString("http://test.com?test=my value")
$api_url = [uri]::EscapeUriString($api_url)

$json = Invoke-RestMethod -Uri $api_url
#$data = $json | ConvertFrom-Json
Write-Host $districts[0] $buildings[0] $json
