var domain = [];
domain[0] = "https://colorpalette.ddns.net:8443/";
domain[1] = "https://covid-hk.github.io/";
var ajax_retry_times = 0;
var ajax_retry_times_max = domain.length - 1;
var googleapis_maps = [];
var googleapis_maps_hashmap = [];
var filetime = [];
var building_list_chi = [];
var building_list_eng = [];
var building_list_chi_ajax_done = false;
var building_list_eng_ajax_done = false;
var building_list = [];
var building_list_dedup = [];

var map_dist = [];
map_dist['北區'] = {'ch':'北區', 'en':'North', 'id':'N', 'case':[], rank:0};
map_dist['大埔'] = {'ch':'大埔', 'en':'Tai Po', 'id':'TP', 'case':[], rank:0};
map_dist['沙田'] = {'ch':'沙田', 'en':'Sha Tin', 'id':'ST', 'case':[], rank:0};
map_dist['西貢'] = {'ch':'西貢', 'en':'Sai Kung', 'id':'SK', 'case':[], rank:0};
map_dist['屯門'] = {'ch':'屯門', 'en':'Tuen Mun', 'id':'TM', 'case':[], rank:0};
map_dist['元朗'] = {'ch':'元朗', 'en':'Yuen Long', 'id':'YL', 'case':[], rank:0};
map_dist['荃灣'] = {'ch':'荃灣', 'en':'Tsuen Wan', 'id':'TW', 'case':[], rank:0};
map_dist['葵青'] = {'ch':'葵青', 'en':'Kwai Tsing', 'id':'KNT', 'case':[], rank:0};
map_dist['離島'] = {'ch':'離島', 'en':'Islands', 'id':'IS', 'case':[], rank:0};
map_dist['油尖旺'] = {'ch':'油尖旺', 'en':'Yau Tsim Mong', 'id':'YTM', 'case':[], rank:0};
map_dist['深水埗'] = {'ch':'深水埗', 'en':'Sham Shui Po', 'id':'SSP', 'case':[], rank:0};
map_dist['九龍城'] = {'ch':'九龍城', 'en':'Kowloon City', 'id':'KC', 'case':[], rank:0};
map_dist['黃大仙'] = {'ch':'黃大仙', 'en':'Wong Tai Sin', 'id':'WTS', 'case':[], rank:0};
map_dist['觀塘'] = {'ch':'觀塘', 'en':'Kwun Tong', 'id':'KT', 'case':[], rank:0};
map_dist['中西區'] = {'ch':'中西區', 'en':'Central & Western', 'id':'CNW', 'case':[], rank:0};
map_dist['灣仔'] = {'ch':'灣仔', 'en':'Wan Chai', 'id':'WC', 'case':[], rank:0};
map_dist['東區'] = {'ch':'東區', 'en':'Eastern', 'id':'E', 'case':[], rank:0};
map_dist['南區'] = {'ch':'南區', 'en':'Southern', 'id':'S', 'case':[], rank:0};

var map_type = [];
map_type['住宅'] = {'ch':'住宅', 'en':'Residential'};
map_type['非住宅'] = {'ch':'非住宅', 'en':'Non-Residential'};
map_type['食肆'] = {'ch':'食肆', 'en':'Restaurant'};

String.prototype.capitalize = function(){
  return this && this
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

String.prototype.isNumber = function(){
  return /^\d+$/.test(this);
}

String.prototype.isInteger = function(){
  return /^-?\d+$/.test(this);
}

String.prototype.isFloat = function(){
  return /^-?\d+(?:[.,]\d*?)?$/.test(this);
}

Number.prototype.toOrdinal = function(){
  if (this <= 0) { return {'number':this, 'suffix':''}; }
  else if (this % 100 >= 11 && this % 100 <= 13) { return {'number':this, 'suffix':'th'}; }
  else if (this % 10 == 1) { return {'number':this, 'suffix':'st'}; }
  else if (this % 10 == 2) { return {'number':this, 'suffix':'nd'}; }
  else if (this % 10 == 3) { return {'number':this, 'suffix':'rd'}; }
  return {'number':this, 'suffix':'th'};
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

$(document).ready(function(){
  getFileTimeCsv();
  getGoogleApisMapsCsv();
});

// When the user scrolls down from the top of the document, show the button
$(window).scroll(function(){
  let scrollTop = ($(window).scrollTop() || $(document).scrollTop() || $('html,body').scrollTop());
  let offsetTop = $('#search-keyword').offset().top;
  if (scrollTop > offsetTop) {
    $('#backToTopBtn').fadeIn();
  } else {
    $('#backToTopBtn').fadeOut();
  }
});

// When the user clicks on the button, scroll to the top of the document
function backToTop() {
  let offsetTop = $('.button-wrap').offset().top;
  window.scrollTo({ top: offsetTop, behavior: 'smooth' });
}

function cleanSearchBox(forced) {
  if ($("#search-keyword").val() != '' || forced) {
    $("#search-keyword").val('');
    refreshUI();
  }
}

function chooseDefaultDistrict() {
  let district_cases = Object.values(map_dist).map(dist => ({ id:dist.id, num_of_cases:dist.case.length, rank:0 }));
  // Sort district by number of cases in desc order
  district_cases.sort(function(a, b) {
    return 0 - (a.num_of_cases - b.num_of_cases);
  });
  // Assign the rank values
  for (let i=0; i<district_cases.length; i++) {
    district_cases[i].rank = i + 1;
  }
  // Handle dead heat / draw / tie case
  for (let i=1; i<district_cases.length; i++) {
    if (district_cases[i-1].num_of_cases > district_cases[i].num_of_cases) { continue; }
    district_cases[i].rank = district_cases[i-1].rank;
  }
  // Copy the rank values to global map_dist
  let district_ranks = [];
  for (let i=0; i<district_cases.length; i++) {
    district_ranks[district_cases[i].id] = district_cases[i].rank;
  }
  for (let dist_ch in map_dist) {
    map_dist[dist_ch]['rank'] = district_ranks[map_dist[dist_ch]['id']];
  }

  // Assign the num_of_cases and rank values to the badge-district elements
  for (let dist_ch in map_dist) {
    let id = map_dist[dist_ch]['id'].toLowerCase();
    let num_of_cases = map_dist[dist_ch]['case'].length;
    let rank = map_dist[dist_ch]['rank'].toOrdinal();
	$('#badge-district-'+id).attr('data-case', num_of_cases);
	$('#badge-district-'+id).attr('data-rank', rank.number);
	$('#badge-district-'+id).attr('data-rank-suffix', rank.suffix);
  }
  // Animation of badge-district elements
  let $element = $('.badge-district');
  function fadeInOut() {
    $element.delay(2000).fadeOut(1500, function(){
      $element.html(function(){
        let sup_style = '';
        if ($(this).attr('data-rank') <= 1) {
          sup_style = 'font-size:60%;color:red;';
        }
        else if ($(this).attr('data-rank') <= 3) {
          sup_style = 'font-size:60%;color:orange;';
        }
        else if ($(this).attr('data-rank') <= 9) {
          sup_style = 'font-size:60%;color:yellow;';
        }
        else {
          sup_style = 'font-size:60%;color:lime;';
        }
        return '<sup style="' + sup_style + '">' + $(this).attr('data-rank') + $(this).attr('data-rank-suffix') + ' </sup>' + $(this).attr('data-case');
      });
      $element.fadeIn(1500);
    });
  }
  fadeInOut();

  let district_id = getCookie("covid_hk_district_id");
  if (district_id == '') {
    district_id = district_cases[0].id;
  }
  $('#district-'+district_id.toLowerCase()).click();
}

function refreshUI() {
  if ($('#input-group-distance').css('display') == 'none' && isValidUserLocation()) {
    // Custom fadeIn to display as inline-block
    $('#input-group-distance').css({
      opacity: 0,
      display: 'inline-block'
    }).animate({opacity:1},2000);
  }

  if (!($('input[name="input-district"]:checked').val().isNumber())) {
    setCookie("covid_hk_district_id", $('input[name="input-district"]:checked').val(), 7);
  }

  $('#wrapper-table-building-loading').show();
  $('#wrapper-table-building').hide();
  let html = constructBuildingListTable(building_list_dedup);
  setTimeout(function(){
    $('#wrapper-table-building').html($(html).hide().fadeIn(2000));
    $('#wrapper-table-building').show();
    $('#wrapper-table-building-loading').hide();

    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});
  }, 100);
}

function getGoogleApisMapsCsv() {
  let unixtimestamp = Math.floor(Date.now() / 1000);
  let unixtimestampper15mins = Math.floor(unixtimestamp / 1000);
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times_max] + "googleapis_maps.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      googleapis_maps = $.csv.toObjects(response);
      if (googleapis_maps.length > 0) {
        googleapis_maps_hashmap = new Map(googleapis_maps.map(item => [item['地區']+','+item['大廈名單'], {'lat':item['lat'],'lng':item['lng']}]));

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

function getFileTimeCsv() {
  let unixtimestamp = Math.floor(Date.now() / 1000);
  let unixtimestampper15mins = Math.floor(unixtimestamp / 1000);
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "filetime.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      filetime = $.csv.toObjects(response);
      if (filetime.length > 0) {
        $('#header-update-time').html($('<span><i class="far fa-clock"></i>&nbsp;&nbsp;更新時間: '+moment(filetime[0].file_time, 'YYYY-MM-DDTHH:mm:ss').format('M月D日 h:mma')+'</span>').hide().fadeIn(2000));
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getFileTimeCsv();
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getFileTimeCsv();
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
      building_list_chi_ajax_done = true;
      if (building_list_chi.length > 0 && building_list_eng.length > 0 && building_list_chi.length == building_list_eng.length) {
        mergeBuildingList();
        chooseDefaultDistrict();
        refreshUI();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max && building_list_chi_ajax_done && building_list_eng_ajax_done) {
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
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "building_list_eng.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      building_list_eng = $.csv.toObjects(response);
      building_list_eng_ajax_done = true;
      if (building_list_chi.length > 0 && building_list_eng.length > 0 && building_list_chi.length == building_list_eng.length) {
        mergeBuildingList();
        chooseDefaultDistrict();
        refreshUI();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max && building_list_chi_ajax_done && building_list_eng_ajax_done) {
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

function mergeBuildingList() {
  building_list = [];
  for (let i = 0; i < building_list_chi.length; i++) {
    let obj = [];
    obj['dist'] = map_dist[building_list_chi[i]['地區']];
    obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':building_list_eng[i]['Building name']};

    // Data bug, special handling temporarily
    //if (i > 1199 - 2) {
    //  obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':building_list_eng[i-1]['Building name']};
    //}
    //else if (i == 1199 - 2) {
    //  obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':''};
    //}
    //else {
    //  obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':building_list_eng[i]['Building name']};
    //}

    // Data bug, special handling temporarily
    if (false) { }
    else if (building_list_chi[i]['地區'].startsWith('九龍城')) { obj['dist'] = map_dist['九龍城']; }
    else if (obj['buil']['ch'].startsWith('加州花園')) { obj['dist'] = map_dist['元朗']; }
    else if (obj['buil']['ch'].startsWith('天富苑')) { obj['dist'] = map_dist['元朗']; }
    else if (obj['buil']['ch'].startsWith('天恒邨')) { obj['dist'] = map_dist['元朗']; }
    else if (obj['buil']['ch'].startsWith('天澤邨')) { obj['dist'] = map_dist['元朗']; }
    else if (obj['buil']['ch'].startsWith('寶達邨')) { obj['dist'] = map_dist['觀塘']; }
    else if (obj['buil']['ch'].startsWith('愛民邨')) { obj['dist'] = map_dist['九龍城']; }
    else if (obj['buil']['ch'].startsWith('樂華(北)邨')) { obj['dist'] = map_dist['觀塘']; }
    else if (obj['buil']['ch'].startsWith('深圳灣')) { obj['dist'] = map_dist['元朗']; }
    else if (obj['buil']['ch'].startsWith('白田')) { obj['dist'] = map_dist['深水埗']; }
    else if (obj['buil']['ch'].startsWith('石籬')) { obj['dist'] = map_dist['葵青']; }
    else if (obj['buil']['ch'].startsWith('華心邨')) { obj['dist'] = map_dist['北區']; }
    else if (obj['buil']['ch'].startsWith('藍地綠怡居')) { obj['dist'] = map_dist['屯門']; }

    obj['type'] = map_type['住宅'];
    if (obj['buil']['ch'].includes('非住宅')) {
      obj['buil']['ch'] = obj['buil']['ch'].replace(' (非住宅)', '');
      obj['buil']['en'] = obj['buil']['en'].replace(' (non-residential)', '');
      obj['type'] = map_type['非住宅'];
    }
    obj['date'] = building_list_chi[i]['最後個案居住日期'];
    if (obj['date'] != '') {
      obj['date'] = moment(obj['date'], 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    obj['case'] = building_list_chi[i]['相關疑似/確診個案'].replace(/\s/g, '');

    building_list.push(obj);
  }

  // Sort building_list by 地區, 大廈名單, 住宅/非住宅, 日期
  building_list.sort(function(a, b) {
    if (a['dist']['ch'] < b['dist']['ch']) {
      return -1;
    }
    else if (a['dist']['ch'] > b['dist']['ch']) {
      return 1;
    }
    else {
      if (a['buil']['ch'] < b['buil']['ch']) {
        return -1;
      }
      else if (a['buil']['ch'] > b['buil']['ch']) {
        return 1;
      }
      else {
        if (a['type']['ch'] == '住宅' && b['type']['ch'] == '非住宅') {
          return -1;
        }
        else if (a['type']['ch'] == '非住宅' && b['type']['ch'] == '住宅') {
          return 1;
        }
        else {
          if (a['date'] < b['date']) {
            return -1;
          }
          else if (a['date'] > b['date']) {
            return 1;
          }
          else {
            return 0;
          }
        }
      }
    }
    return 0;
  });

  // Copy building_list to building_list_dedup, dedup by 大廈名單
  building_list_dedup = [];
  for (let i = 0; i < building_list.length; i++) {
    if (building_list_dedup.length == 0 || building_list_dedup[building_list_dedup.length-1]['buil']['ch'] != building_list[i]['buil']['ch']) {
      let obj = [];
      obj['dist'] = building_list[i]['dist'];
      obj['buil'] = building_list[i]['buil'];
      obj['type'] = building_list[i]['type'];
      obj['date'] = building_list[i]['date'];
      obj['case'] = building_list[i]['case'];
      obj['lat'] = building_list[i]['lat'];
      obj['lng'] = building_list[i]['lng'];
      building_list_dedup.push(obj);
    }
    else {
      building_list_dedup[building_list_dedup.length-1]['date'] = building_list[i]['date'];
      building_list_dedup[building_list_dedup.length-1]['case'] = building_list_dedup[building_list_dedup.length-1]['case'].concat(',', building_list[i]['case']);
    }
  }

  // Convert building_list_dedup[i]['case'] format from string to int array
  for (let i = 0; i < building_list_dedup.length; i++) {
    building_list_dedup[i]['case'] = building_list_dedup[i]['case'].split(',').map(Number);
    // dedup case id list
    building_list_dedup[i]['case'] = building_list_dedup[i]['case'].filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    building_list_dedup[i]['case'].sort();
    building_list_dedup[i]['case'].reverse();
    // badge = case group (info, warning, danger, dark)
    building_list_dedup[i]['badge'] = 'info';
    if (building_list_dedup[i]['case'].length > 19) {
      building_list_dedup[i]['badge'] = 'dark';
    }
    else if (building_list_dedup[i]['case'].length > 9) {
      building_list_dedup[i]['badge'] = 'danger';
    }
    else if (building_list_dedup[i]['case'].length > 2) {
      building_list_dedup[i]['badge'] = 'warning';
    }
  }

  // Calculate cases per district
  for (let i = 0; i < building_list_dedup.length; i++) {
    let dist_ch = building_list_dedup[i]['dist']['ch'];
    map_dist[dist_ch]['case'] = map_dist[dist_ch]['case'].concat(building_list_dedup[i]['case']);
  }
  for (let dist_ch in map_dist) {
    // dedup case id list
    map_dist[dist_ch]['case'] = map_dist[dist_ch]['case'].filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    map_dist[dist_ch]['case'].sort();
    map_dist[dist_ch]['case'].reverse();
    // Append case count per district to district label
    $("#label-district-"+map_dist[dist_ch]['id'].toLowerCase()).append('<br/><span class="badge badge-secondary badge-district" id="badge-district-'+map_dist[dist_ch]['id'].toLowerCase()+'">'+map_dist[dist_ch]['case'].length+'</span>');
  }

  // Sort data by badge level (info > warning > danger > dark)
  building_list_dedup.sort(function(a, b) {
    if (getBadgePriority(a['badge']) < getBadgePriority(b['badge'])) {
      return -1;
    }
    else if (getBadgePriority(a['badge']) > getBadgePriority(b['badge'])) {
      return 1;
    }
    else {
      return 0;
    }
    return 0;
  });

  // Assign lat & lng to the building_list
  for (let i = 0; i < building_list_dedup.length; i++) {
    let cachedLatLng = googleapis_maps_hashmap.get(building_list_dedup[i]['dist']['ch'] + ',' + building_list_dedup[i]['buil']['ch']);
    if (typeof cachedLatLng !== 'undefined') {
      // Check if already exists, assign the correct lat & lng of this building
      building_list_dedup[i]['lat'] = cachedLatLng['lat'];
      building_list_dedup[i]['lng'] = cachedLatLng['lng'];
    }
    else {
      // if not exists, assign 0.0 to both lat & lng
      building_list_dedup[i]['lat'] = 0.0;
      building_list_dedup[i]['lng'] = 0.0;
    }
  }
}

function getBadgePriority(badge) {
  let priority = 10;
  switch (badge) {
    case 'dark':
      priority = 1;
      break;
    case 'danger':
      priority = 2;
      break;
    case 'warning':
      priority = 3;
      break;
    case 'info':
    default:
      priority = 9;
      break;
  }
  return priority;
}

function constructBuildingListTable(data) {
  let user_latitude = user_location.latitude;
  let user_longitude = user_location.longitude;

  // Assign distance to the data list
  for (let i = 0; i < data.length; i++) {
    if (isValidUserLocation()) {
      if (isValidLocation(data[i]['lat'], data[i]['lng'])) {
        data[i]['distance'] = calculateDistanceBetweenLatLong(user_latitude, user_longitude, data[i]['lat'], data[i]['lng']);
        data[i]['bearing'] = calculateBearingBetweenLatLong(user_latitude, user_longitude, data[i]['lat'], data[i]['lng']);
      }
      else {
        data[i]['distance'] = 1000 * 1000;
        data[i]['bearing'] = -1;
      }
    }
    else {
      data[i]['distance'] = 1000 * 1000;
      data[i]['bearing'] = -1;
    }
  }

  if (isValidUserLocation()) {
    // Make a copy of data array first to avoid any modification of the original data source
    data = data.slice();
    // Here sort data 3 times to avoid javascript sorting bug
    // Sort data by distance
    data.sort(function(a, b) {
      return (a['distance'] - b['distance']);
    });
    // Sort data by distance
    data.sort(function(a, b) {
      return 0 - (a['distance'] - b['distance']);
    });
    // Sort data by distance
    data.sort(function(a, b) {
      return (a['distance'] - b['distance']);
    });
  }

  /* Bootstrap 4 style grid as table */
  /* https://www.codeply.com/go/IDBemcEAyL */
  let html = '<div class="col-12 grid-striped table table-condensed table-hover table-striped" id="table-building">';

  html += '<div class="row py-2 font-weight-bold">';
  html += '<div class="col-3">';
  if (isValidUserLocation()) {
    html += '<i class="fas fa-crosshairs"></i> 距離<br/>Distance';
  }
  else {
    html += '<i class="far fa-clock"></i> 日期<br/>Date';
  }
  html += '</div>';
  html += '<div class="col-6">';
  html += '<i class="far fa-building"></i> 大廈名單<br/>Building name';
  html += '</div>';
  html += '<div class="col-3">';
  html += '<i class="fas fa-biohazard"></i> 個案<br/>Cases';
  html += '</div>';
  html += '</div>';

  let html_inner = '';
  let result_cases = [];
  let result_count = 0;
  if(typeof(data[0]) === 'undefined') {
    result_count = 0;
  }
  else {
    let show_new_only = $('#show-new-only').is(':checked');
    let keyword = $("#search-keyword").val().toLowerCase();
    let keyword_as_int = 0;
    if (keyword.isNumber()) {
      keyword_as_int = parseInt(keyword, 10);
    }
    let distance_range = 0;
    if (isValidUserLocation()) {
      let radio_input = $('input[name="input-district"]:checked').val();
      let radio_input_as_int = 0;
      if (radio_input.isNumber()) {
        radio_input_as_int = parseInt(radio_input, 10);
        distance_range = radio_input_as_int;
      }
    }
    let last_date_cases = getLastDateCases();
    $.each(data, function( index, row ) {
      let is_new_case = false;
      for (let c = 0; c < row['case'].length; c++) {
        if (last_date_cases.includes(row['case'][c])) {
          is_new_case = true;
          break;
        }
      }
      let distance = row['distance'];
      let filtered = true;
      // 選擇 地區
      if (keyword == '' && row['dist']['id'] == $('input[name="input-district"]:checked').val()) {
        filtered = false;
      }
      // 選擇 距離
      if (keyword == '' && distance <= distance_range) {
        filtered = false;
      }
      // 輸入 個案編號
      if (keyword_as_int > 0 && row['case'].includes(keyword_as_int)) {
        filtered = false;
      }
      // 輸入 大廈字詞
      if (keyword != '' && (row['buil']['ch'].toLowerCase().includes(keyword) || row['buil']['en'].toLowerCase().includes(keyword))) {
        filtered = false;
      }
      // Handle the case when case list is not case numbers, e.g. 台灣衛生福利部疾病管制署通報的個案
      if (row['case'].length == 0) {
        filtered = true;
      }
      // 顯示新增個案 only
      if (show_new_only && !is_new_case) {
        filtered = true;
      }
      if (!filtered) {
        html_inner += '<div class="row py-2">';
        html_inner += '<div class="col-3">';
        if (isValidUserLocation()) {
          if (isValidLocation(row['lat'], row['lng'])) {
            // badge = distance (success, warning, danger, dark)
            let badge = 'success';
            if (distance <= 400.0) {
              badge = 'dark';
            }
            else if (distance <= 800.0) {
              badge = 'danger';
            }
            else if (distance <= 1600.0) {
              badge = 'warning';
            }
            html_inner += '<h5>';
            html_inner += '<a href="javascript:void(0)" data-toggle="tooltip" title="' + (row['date'] == '' ? '' : (moment(row['date'], 'YYYY-MM-DD').format('M月D日'))) + '">';
            html_inner += '<span class="badge badge-' + badge + '">';
            let bearing = getFormattedBearing(row['bearing']);
            if (bearing == 'N') {
              html_inner += '<i class="far fa-arrow-alt-circle-up"></i> ';
            }
            else if (bearing == 'E') {
              html_inner += '<i class="far fa-arrow-alt-circle-right"></i> ';
            }
            else if (bearing == 'S') {
              html_inner += '<i class="far fa-arrow-alt-circle-down"></i> ';
            }
            else if (bearing == 'W') {
              html_inner += '<i class="far fa-arrow-alt-circle-left"></i> ';
            }
            html_inner += getFormattedDistance(distance);
            html_inner += '</span>';
            html_inner += '</a>';
            html_inner += '</h5>';
          }
          else {
            html_inner += (row['date'] == '' ? '' : (moment(row['date'], 'YYYY-MM-DD').format('M月D日') + '<br/>' + moment(row['date'], 'YYYY-MM-DD').format('MMM Do')));
          }
        }
        else {
          html_inner += (row['date'] == '' ? '' : (moment(row['date'], 'YYYY-MM-DD').format('M月D日') + '<br/>' + moment(row['date'], 'YYYY-MM-DD').format('MMM Do')));
        }
        html_inner += '</div>';
        html_inner += '<div class="col-6">';
        if (is_new_case) {
          html_inner += '<i class="fas fa-biohazard" style="color:red;"></i> ';
        }
        html_inner += '<a href="http://maps.google.com/maps?q=' + row['buil']['ch'] + '+' + row['dist']['ch'] + '" target="_blank">' + row['dist']['ch'] + ' ' + row['buil']['ch'] + '</a>';
        html_inner += '<br/>';
        html_inner += '<a href="http://maps.google.com/maps?q=' + row['buil']['en'] + '+' + row['dist']['en'] + '" target="_blank">' + row['buil']['en'] + ', ' + row['dist']['en'] + '</a>';
        html_inner += '</div>';
        html_inner += '<div class="col-3">';
        html_inner += '<h4>';
        html_inner += '<span data-toggle="modal" data-target="#caseDetailModal" onclick="constructCaseDetailsModal($(this))" data-buil-ch="' + row['buil']['ch'] + '" data-buil-en="' + row['buil']['en'] + '" data-dist-ch="' + row['dist']['ch'] + '" data-dist-en="' + row['dist']['en'] + '" data-badge="' + row['badge'] + '" data-cases="' + row['case'].join(',') + '">';
        html_inner += '<a href="javascript:void(0)" data-toggle-disabled="tooltip" title="' + row['case'].join(', ') + '">';
        html_inner += '<span class="badge badge-' + row['badge'] + '">' + row['case'].length + '</span>';
        html_inner += '</a>';
        html_inner += '</span>';
        html_inner += '</h4>';
        html_inner += '</div>';
        html_inner += '</div>';
        result_cases = result_cases.concat(row['case']);
        result_count++;
      }
    });
    // dedup result_cases
    result_cases = result_cases.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    result_cases.sort();
    result_cases.reverse();
  }

  if (result_count == 0) {
    html += '<div class="row py-2">';
    html += '<div class="col-3">';
    html += '</div>';
    html += '<div class="col-6">';
    html += '<mark style="font-size:0.8rem;"><i class="fas fa-search"></i> 找不到相關大廈<br/>No Building Found</mark>';
    html += '</div>';
    html += '<div class="col-3">';
    html += '</div>';
    html += '</div>';
  }
  else {
    html += '<div class="row py-2">';
    html += '<div class="col-3">';
    html += '</div>';
    html += '<div class="col-6">';
    html += '<mark style="font-size:0.8rem;"><i class="fas fa-search"></i> 找到 <b>'+result_count+'</b> 座相關大廈<br/><b>'+result_count+'</b> Building(s) Found<br/><i class="far fa-hand-point-right"></i> 個案數字查看詳情 <i class="fas fa-project-diagram"></i><br/><i class="far fa-hand-point-down"></i> 大廈名稱打開地圖 <i class="fas fa-map-marked-alt"></i><br/>(<i class="fas fa-biohazard" style="color:red;"></i> 表示涉及新增個案)</mark>';
    html += '</div>';
    html += '<div class="col-3">';
    html += '<h4>';
    html += '<span data-toggle-disabled="modal" data-target="#caseDetailModal" data-badge="light" data-cases="' + result_cases.join(',') + '">';
    html += '<a href="javascript:void(0)" data-toggle="tooltip" title="' + result_cases.join(', ') + '">';
    html += '<span class="badge badge-light">' + result_cases.length + '</span>';
    html += '</a>';
    html += '</span>';
    html += '</h4>';
    html += '</div>';
    html += '</div>';
    html += html_inner;
  }

  html += '</div>';
  return html;
}
