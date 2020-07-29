$(document).ready(function(){
  //
});

/* HTML Geolocation API */
/* https://www.w3schools.com/html/html5_geolocation.asp */
/* Lat-long coorditates for cities in Hong Kong are in range */
/* Latitude from 22.22623 to 22.45007 */
/* Longitude from 113.97157 to 114.26667 */

function getLocation() {
  if (navigator.geolocation) {
    //navigator.geolocation.getCurrentPosition(showPosition);
    navigator.geolocation.watchPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  console.log("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);

  var latlon = position.coords.latitude + "," + position.coords.longitude;
  var img_url = "https://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=400x300&sensor=false&key=YOUR_KEY";
  console.log("<div id='mapholder'><img src='"+img_url+"'></div>");
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}

/* Calculate distance, bearing and more between Latitude/Longitude points */
/* https://www.movable-type.co.uk/scripts/latlong.html */

function calculateDistanceBetweenLatLong(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres

  return d;
}
