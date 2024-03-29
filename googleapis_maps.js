/* https://developers.google.com/places/web-service/search */
/* https://developers.google.com/maps/documentation/javascript/places */

var googleapis_maps_hashmap = [];

String.prototype.isNumber = function(){
  return /^\d+$/.test(this);
}

String.prototype.isInteger = function(){
  return /^-?\d+$/.test(this);
}

String.prototype.isFloat = function(){
  return /^-?\d+(?:[.,]\d*?)?$/.test(this);
}

String.prototype.toCsvQuotedField = function(){
  return this && (this.includes(',') ? ('"' + this + '"') : this);
}

$(document).ready(function(){
  getBuildingListChiCsv(onReadyCsv);
  getGoogleApisMapsCsv(onReadyCsv);
});

function onReadyCsv() {
  if (isAjaxDone(['building_list_chi', 'googleapis_maps'])) {
    setTimeout(function(){
      onReadyGoogleApisMapsDataInit();
      getLatLongFromGoogleMapApi();
    }, 0);
  }
}

function onReadyGoogleApisMapsDataInit() {
  googleapis_maps_hashmap = new Map(csv_obj['googleapis_maps'].map(item => [item['地區']+','+item['大廈名單'], {
    '地區': item['地區'],
    '大廈名單': item['大廈名單'],
    'name': item['name'],
    'lat': item['lat'],
    'lng': item['lng'] }])
  );
}

function getLatLongFromGoogleMapApi() {
  let hongkong = new google.maps.LatLng(22.302711, 114.177216);

  let infowindow = new google.maps.InfoWindow();

  let map = new google.maps.Map(document.getElementById('map'), {center: hongkong, zoom: 9});

  let service = new google.maps.places.PlacesService(map);

  $('#result').append('地區,大廈名單,name,lat,lng<br/>');
  googleapis_maps_hashmap.forEach(function (value, key, map) {
    //if (!value['lat'].toString().isFloat() || !value['lng'].toString().isFloat()) {
    //  console.log(value);
    //}
    $('#result').append(value['地區'] + ',' + value['大廈名單'].toCsvQuotedField() + ',' + value['name'].toCsvQuotedField() + ',' + value['lat'] + ',' + value['lng'] + '<br/>');
  });

  let q = new Queue();
  for (let i = 0; i < csv_obj['building_list_chi'].length; i++) {
    let district = csv_obj['building_list_chi'][i]['地區'];
    let building = csv_obj['building_list_chi'][i]['大廈名單'].replace(' (非住宅)', '');

    // Data bug, special handling temporarily
    if (false) { }
    else if (district.startsWith('九龍城')) { district = '九龍城'; }
    else if (district.startsWith('油尖旺區')) { district = '油尖旺'; }
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
    else if (building.startsWith('愛定商場')) { district = '屯門'; }
    else if (building.startsWith('葵涌邨')) { district = '葵青'; }
    else if (building.startsWith('葵涌葵涌邨')) { district = '葵青'; }

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
              let googlename = results[0].name;
              $('#result').append(district + ',' + building.toCsvQuotedField() + ',' + googlename.toCsvQuotedField() + ',' + geometry.lat + ',' + geometry.lng + '<br/>');
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
