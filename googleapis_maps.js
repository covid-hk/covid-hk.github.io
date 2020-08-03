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
    url: domain[ajax_retry_times_max] + "googleapis_maps.csv?t=" + unixtimestamp,
    dataType: "text",
    success: function(response)
    {
      googleapis_maps = $.csv.toObjects(response);
      if (googleapis_maps.length > 0) {
        googleapis_maps_hashmap = new Map(googleapis_maps.map(item => [item['地區']+','+item['大廈名單'], item['地區']+','+item['大廈名單']+','+item['name']+','+item['lat']+','+item['lng']]));

        getBuildingListCsv();
      }
      // if no result
      //else if (ajax_retry_times < ajax_retry_times_max) {
      //  ++ajax_retry_times;
      //  getGoogleApisMapsCsv();
      //}
    },
    error: function()
    {
      //if (ajax_retry_times < ajax_retry_times_max) {
      //  ++ajax_retry_times;
      //  getGoogleApisMapsCsv();
      //}
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

  $('#result').append('地區,大廈名單,name,lat,lng<br/>');
  googleapis_maps_hashmap.forEach(function (value, key, map) {
    $('#result').append(value + '<br/>');
  });

  let q = new Queue();
  for (let i = 0; i < building_list_chi.length; i++) {
    let district = building_list_chi[i]['地區'];
    let building = building_list_chi[i]['大廈名單'].replace(' (非住宅)', '');

    // Data bug, special handling temporarily
    if (false) { }
    else if (building.startsWith('加州花園')) { district = '元朗'; }
    else if (building.startsWith('天富苑')) { district = '元朗'; }
    else if (building.startsWith('天恒邨')) { district = '元朗'; }
    else if (building.startsWith('天澤邨')) { district = '元朗'; }
    else if (building.startsWith('寶達邨')) { district = '觀塘'; }
    else if (building.startsWith('愛民邨')) { district = '九龍城'; }
    else if (building.startsWith('樂華(北)邨')) { district = '觀塘'; }
    else if (building.startsWith('深圳灣')) { district = '元朗'; }
    else if (building.startsWith('白田')) { district = '深水埗'; }
    else if (building.startsWith('石籬')) { district = '葵青'; }
    else if (building.startsWith('華心邨')) { district = '北區'; }
    else if (building.startsWith('藍地綠怡居')) { district = '屯門'; }

    if (typeof googleapis_maps_hashmap.get(district + ',' + building) !== 'undefined') {
      // Check if already exists, do nothing
      continue;
    }
    else {
      // if not exists, push the element into queue to process later
      q.enqueue({'district': district, 'building': building});
    }
  }

  let loop = 0;
  while (!q.isEmpty()) {
    let item = q.peek();
    let district = item.district;
    let building = item.building;

    if (typeof googleapis_maps_hashmap.get(district + ',' + building) !== 'undefined') {
      // Check if already exists, dequeue and loop to peek next item
      q.dequeue();
      continue;
    }
    else {
      setTimeout(function timer() {
        loop--;
        console.log('loop: ' + (loop + 1) + ', ' + district + ', ' + building);

        let request = { query: district + ' ' + building, fields: ['name', 'geometry'] };

        service.findPlaceFromQuery(request, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            if (results.length > 0) {
              let geometry = results[0].geometry.location.toJSON();
              let building2 = building;
              if (building2.includes(',')) {
                building2 = '"' + building2 + '"';
              }
              let googlename2 = results[0].name;
              if (googlename2.includes(',')) {
                googlename2 = '"' + googlename2 + '"';
              }
              $('#result').append(district + ',' + building2 + ',' + googlename2 + ',' + geometry.lat + ',' + geometry.lng + '<br/>');
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
      }, loop * 1000);

      q.dequeue();
      loop++;
    }
  }
}
