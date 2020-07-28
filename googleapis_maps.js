/* https://developers.google.com/places/web-service/search */
/* https://developers.google.com/maps/documentation/javascript/places */

var domain = [];
domain[0] = "https://colorpalette.ddns.net:8443/";
domain[1] = "https://covid-hk.github.io/";
var ajax_retry_times = 0;
var ajax_retry_times_max = domain.length - 1;
var googleapis_maps = [];
var googleapis_maps_hashmap = [];
var building_list_chi = [];

$(document).ready(function(){
  getGoogleApisMapsCsv();
});

function getGoogleApisMapsCsv() {
  let unixtimestamp = Math.floor(Date.now() / 1000);
  let unixtimestampper15mins = Math.floor(unixtimestamp / 1000);
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "googleapis_maps.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      googleapis_maps = $.csv.toObjects(response);
      if (googleapis_maps.length > 0) {
        googleapis_maps_hashmap = new Map(googleapis_maps.map(item => [item['地區']+','+item['大廈名單'], item['地區']+','+item['大廈名單']+','+item['name']+','+item['lat']+','+item['lng']]));

        getBuildingListCsv();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getGoogleApisMapsCsv();
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getGoogleApisMapsCsv();
      }
    }
  });
}

function getBuildingListCsv() {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/building_list_chi.csv
  // https://www.chp.gov.hk/files/misc/building_list_eng.csv
  let unixtimestamp = Math.floor(Date.now() / 1000);
  let unixtimestampper15mins = Math.floor(unixtimestamp / 1000);
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "building_list_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      building_list_chi = $.csv.toObjects(response);
      if (building_list_chi.length > 0) {
        getLatLongFromGoogleMapApi();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListCsv();
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListCsv();
      }
    }
  });
}

function getLatLongFromGoogleMapApi() {
  let hongkong = new google.maps.LatLng(22.302711, 114.177216);

  let infowindow = new google.maps.InfoWindow();

  let map = new google.maps.Map(document.getElementById('map'), {center: hongkong, zoom: 9});

  let service = new google.maps.places.PlacesService(map);

  $(result).append('地區,大廈名單,name,lat,lng<br/>');
  console.log('length: ' + building_list_chi.length);
  for (let i = 0; i < building_list_chi.length; i++) {
    setTimeout(function timer() {
      let district = building_list_chi[i]['地區'];
      let building = building_list_chi[i]['大廈名單'];
      console.log('loop: ' + (i + 1) + ', ' + district + ', ' + building);

      // Check if already exists
      let hashmapKey = (district + ',' + building);
      let hashmapValue = googleapis_maps_hashmap.get(hashmapKey);
      if (typeof hashmapElement !== 'undefined') {
        $(result).append(hashmapValue + '<br/>');
        return;
      }

      let request = { query: district + ' ' + building, fields: ['name', 'geometry'] };

      service.findPlaceFromQuery(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          if (results.length > 0) {
            let geometry = results[0].geometry.location.toJSON();
            $(result).append(district + ',' + building + ',' + results[0].name + ',' + geometry.lat + ',' + geometry.lng + '<br/>');
          }
        }
        else if (status === google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
          console.log('INVALID_REQUEST');
        }
        else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          console.log('OVER_QUERY_LIMIT');
        }
        else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
          console.log('REQUEST_DENIED');
        }
        else if (status === google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
          console.log('UNKNOWN_ERROR');
        }
        else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.log('ZERO_RESULTS');
        }
      });
    }, i * 1000);
  }
}
