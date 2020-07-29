var user_location = {'latitude': 0.0, 'longitude': 0.0};
//user_location = {'latitude': 0.0, 'longitude': 0.0};

// This indicator is used to avoid refresh UI twice during the web page initialization
var isAlreadyInLocationMode = false;

$(document).ready(function(){
  getLocation();
});

function updateUserLocation(position) {
  let prev_location = {'latitude': 0.0, 'longitude': 0.0};
  prev_location.latitude = user_location.latitude;
  prev_location.longitude = user_location.longitude;
  user_location.latitude = position.coords.latitude;
  user_location.longitude = position.coords.longitude;
  // if user moves from invalid location to valid location, refresh
  if (!isValidLocation(prev_location.latitude, prev_location.longitude) && isValidUserLocation()) {
    setTimeout(function(){
      if (!isAlreadyInLocationMode) {
        refreshUI();
      }
    }, 2000);
  }
}

/* Lat-long coorditates for cities in Hong Kong are in range */
/* Latitude from 22.22623 to 22.45007 */
/* Longitude from 113.97157 to 114.26667 */
function isValidLocation(latitude, longitude) {
  if ( 22.1 <= latitude  && latitude  <= 22.6 &&
      113.8 <= longitude && longitude <= 114.4) {
    return true;
  }
  return false;
}
function isValidUserLocation() {
  let valid = isValidLocation(user_location.latitude, user_location.longitude);
  if (valid && !isAlreadyInLocationMode) {
    isAlreadyInLocationMode = true;
  }
  return valid;
}

function getFormattedDistance(distance) {
  let formatted = '';
  if (distance < 1000.0) {
    formatted = '' + Math.round(distance) + ' m';
  }
  else {
    formatted = '' + (Math.round(distance / 100.0) / 10.0) + ' km';
  }
  return formatted;
}

/* HTML Geolocation API */
/* https://www.w3schools.com/html/html5_geolocation.asp */

function getLocation() {
  if (navigator.geolocation) {
    //navigator.geolocation.getCurrentPosition(showPosition, showError);
    navigator.geolocation.watchPosition(updateUserLocation);
  } else {
    //console.log("Geolocation is not supported by this browser.");
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

  return Math.round(d * 1.0); // return int instead of float to avoid js treat float as string type
}
