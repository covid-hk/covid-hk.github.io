/**
 * https://developers.google.com/maps/documentation/javascript/markers
 * https://mtwmt.github.io/googlemap_bounds/
 * https://coderwall.com/p/t3wjxq/optimal-zoom-level-in-google-maps
 *
 * https://developers.google.com/maps/documentation/javascript/custom-markers
 * https://stackoverflow.com/questions/7095574/google-maps-api-3-custom-marker-color-for-default-dot-marker
 * https://medium.com/free-code-camp/how-to-change-javascript-google-map-marker-color-8a72131d1207
 * https://sites.google.com/site/gmapsdevelopment/
**/

const MEAN_RADIUS_EARTH_IN_KM = 6371;
const DEG_TO_RAD_DIVISOR = 57.2957795;
const ZOOM_FACTOR = 1.6446; // 1.6446;
const ZOOM_MAX = 17; // 21;

window.mapCanvas = $('#caseMapModal');

function toRadians(degrees) {
  return degrees / DEG_TO_RAD_DIVISOR;
}

// Haversine formula to calculate the great-circle distance between two points, i.e. the shortest distance over the earths surface
function haversine(maxLat, minLat, maxLng, minLng) {
  let dLat = maxLat - minLat;
  let dLng = maxLng - minLng;
  let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(minLat) * Math.cos(maxLat) * Math.sin(dLng/2) * Math.sin(dLng/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return MEAN_RADIUS_EARTH_IN_KM * c;
}

function optimalZoomLevel(maxLat, minLat, maxLng, minLng) {
  // min of height and width of element which contains the map
  let minMapDimension = Math.min(window.mapCanvas.width(), window.mapCanvas.height());

  maxLat = toRadians(maxLat);
  minLat = toRadians(minLat);
  maxLng = toRadians(maxLng);
  minLng = toRadians(minLng);
  let greatCircleDistance = haversine(maxLat, minLat, maxLng, minLng);
  return Math.floor(8 - Math.log(ZOOM_FACTOR * greatCircleDistance / Math.sqrt(2 * (minMapDimension * minMapDimension))) / Math.log(2));
}

function pinSymbol(color) {
  return {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#000',
    strokeWeight: 2,
    scale: 1,
  };
}

function constructCaseMapModal() {
  let header = constructCaseMapHeader();
  $('#caseMapModal .modal-header .modal-title').html($(header).hide().fadeIn(2000));
  //$('#caseMapModal .modal-header .modal-title [data-toggle="tooltip"]').tooltip({trigger: 'hover'});

  //let body = constructCaseMapBody();
  //$('#caseMapModal .modal-body').html($(body).hide().fadeIn(2000));
  constructCaseMapBody();
}

function constructCaseMapHeader() {
  let html = '';
  html += '<i class="fas fa-map-marked-alt"></i> <b>'+result_set.length+'</b> 座相關大廈';
  html += '<br/>';
  html += '<b>'+result_set.length+'</b> Building(s)';
  html += '<br/>';
  html += '<a href="javascript:void(0)" data-toggle="tooltip" title="' + result_cases.join(', ') + '">';
  html += '<span class="badge badge-primary" style="font-size:1.3em;">' + result_cases.length + '</span>';
  html += '</a>';
  return html;
}

var activeInfoWindow = null;

function constructCaseMapBody() {
  let min_lat = 22.6;
  let max_lat = 22.1;
  let min_lng = 114.4;
  let max_lng = 113.8;
  $.each(result_set, function( index, row ) {
    if (isValidLocation(row['lat'], row['lng'])) {
      if (min_lat > row['lat']) {
        min_lat = row['lat'];
      }
      if (max_lat < row['lat']) {
        max_lat = row['lat'];
      }
      if (min_lng > row['lng']) {
        min_lng = row['lng'];
      }
      if (max_lng < row['lng']) {
        max_lng = row['lng'];
      }
    }
  });

  let user_latitude = user_location.latitude;
  let user_longitude = user_location.longitude;
  //if (!isValidUserLocation()) {
    user_latitude = (parseFloat(min_lat) + parseFloat(max_lat)) / 2.0;
    user_longitude = (parseFloat(min_lng) + parseFloat(max_lng)) / 2.0;
  //}

  // generate optimal zoom level for Mediterranean area
  let zoomLevel = optimalZoomLevel(max_lat, min_lat, max_lng, min_lng);
  zoomLevel = Math.min(zoomLevel, ZOOM_MAX);

  let myLatlng = new google.maps.LatLng(user_latitude, user_longitude);
  let mapOptions = {
    zoom: zoomLevel,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    //disableDefaultUI: true
  }
  let map = new google.maps.Map(document.getElementById("caseMap"), mapOptions);

  // 新增多點坐標顯示
  //let bounds = new google.maps.LatLngBounds();

  $.each(result_set, function( index, row ) {
    // Add some random value to handle when two map pins have same lat lng values on the map canvas
    let lat = parseFloat(row['lat']) + (Math.random() / 25000.0);
    let lng = parseFloat(row['lng']) + (Math.random() / 25000.0);
    let point = new google.maps.LatLng(lat, lng);
    let data = '';
    data += row['dist']['ch'] + ' ' + row['buil']['ch'];
    data += '<br/>';
    data += row['buil']['en'] + ', ' + row['dist']['en'];
    data += '<br/>';
    data += '<span class="badge badge-' + row['badge'] + '">' + row['case'].length + '</span>';
    let color = '';
    switch (row['badge']) {
      case 'dark':
        color = '#343a40';
        break;
      case 'danger':
        color = '#dc3545';
        break;
      case 'warning':
        color = '#ffc107';
        break;
      case 'info':
        color = '#17a2b8';
        break;
      case 'primary':
        color = '#007bff';
        break;
      case 'secondary':
        color = '#6c757d';
        break;
      case 'light':
      default:
        color = '#f8f9fa';
        break;
    }
    let infowindow = new google.maps.InfoWindow({
      content: data
    });
    let marker = new google.maps.Marker({
      //map: map,
      position: point,
      //title: data,
      draggable: false,
      animation: google.maps.Animation.DROP,
      zIndex: row['case'].length,
      icon: pinSymbol(color),
    });

    // 將所有座標加到可視地圖裡
    //bounds.extend(point);

    google.maps.event.addListener(marker, 'click', function() {
      if (activeInfoWindow) { activeInfoWindow.close(); }
      infowindow.open(map, marker);
      activeInfoWindow = infowindow;
    });

    // To add the marker to the map, call setMap();
    marker.setMap(map);
  });

  // 繪製到地圖
  //map.fitBounds(bounds);

  // 觀察經緯度的變化
  //google.maps.event.addListener(map, 'bounds_changed', function() {
  //  let bounds = map.getBounds();
  //  let NE = bounds.getNorthEast();
  //  let SW = bounds.getSouthWest();
  //});
}
