var domain = [];
domain[0] = "https://colorpalette.ddns.net:8443/";
domain[1] = "https://covid-hk.github.io/";
var ajax_retry_times = 0;
var ajax_retry_times_max = domain.length - 1;
var building_list_chi = [];
var building_list_eng = [];
var building_list = [];
var building_list_dedup = [];

var map_dist = [];
map_dist['北區'] = {'ch':'北區', 'en':'North', 'id':'N', 'case':[]};
map_dist['大埔'] = {'ch':'大埔', 'en':'Tai Po', 'id':'TP', 'case':[]};
map_dist['沙田'] = {'ch':'沙田', 'en':'Sha Tin', 'id':'ST', 'case':[]};
map_dist['西貢'] = {'ch':'西貢', 'en':'Sai Kung', 'id':'SK', 'case':[]};
map_dist['屯門'] = {'ch':'屯門', 'en':'Tuen Mun', 'id':'TM', 'case':[]};
map_dist['元朗'] = {'ch':'元朗', 'en':'Yuen Long', 'id':'YL', 'case':[]};
map_dist['荃灣'] = {'ch':'荃灣', 'en':'Tsuen Wan', 'id':'TW', 'case':[]};
map_dist['葵青'] = {'ch':'葵青', 'en':'Kwai Tsing', 'id':'KNT', 'case':[]};
map_dist['離島'] = {'ch':'離島', 'en':'Islands', 'id':'IS', 'case':[]};
map_dist['油尖旺'] = {'ch':'油尖旺', 'en':'Yau Tsim Mong', 'id':'YTM', 'case':[]};
map_dist['深水埗'] = {'ch':'深水埗', 'en':'Sham Shui Po', 'id':'SSP', 'case':[]};
map_dist['九龍城'] = {'ch':'九龍城', 'en':'Kowloon City', 'id':'KC', 'case':[]};
map_dist['黃大仙'] = {'ch':'黃大仙', 'en':'Wong Tai Sin', 'id':'WTS', 'case':[]};
map_dist['觀塘'] = {'ch':'觀塘', 'en':'Kwun Tong', 'id':'KT', 'case':[]};
map_dist['中西區'] = {'ch':'中西區', 'en':'Central & Western', 'id':'CNW', 'case':[]};
map_dist['灣仔'] = {'ch':'灣仔', 'en':'Wan Chai', 'id':'WC', 'case':[]};
map_dist['東區'] = {'ch':'東區', 'en':'Eastern', 'id':'E', 'case':[]};
map_dist['南區'] = {'ch':'南區', 'en':'Southern', 'id':'S', 'case':[]};

var map_type = [];
map_type['住宅'] = {'ch':'住宅', 'en':'Residential'};
map_type['非住宅'] = {'ch':'非住宅', 'en':'Non-Residential'};
map_type['食肆'] = {'ch':'食肆', 'en':'Restaurant'};

String.prototype.capitalize = function() {
  return this && this
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

String.prototype.isNumber = function() {
  return /^\d+$/.test(this);
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

$(document).ready(function() {
  var district_id = getCookie("covid_hk_district_id");
  if (district_id == '') {
    district_id = 'WTS';
  }
  $('#district-'+district_id.toLowerCase()).click();

  getBuildingListCsv();
});

function cleanSearchBox(forced) {
  if ($("#search-keyword").val() != '' || forced) {
    $("#search-keyword").val('');
    refreshUI();
  }
}

function refreshUI() {
  setCookie("covid_hk_district_id", $('input[name="input-district"]:checked').val(), 7);

  $('#wrapper-table-building').hide();
  $('#wrapper-table-building-loading').show();
  let html = constructBuildingListTable(building_list_dedup);
  setTimeout(function(){
    $('#wrapper-table-building-loading').hide();
    $('#wrapper-table-building').html($(html).hide().fadeIn(2000));
    $('#wrapper-table-building').show();

    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();
  }, 100);
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
      if (building_list_chi.length > 0 && building_list_eng.length > 0) {
        mergeBuildingList();
        refreshUI();
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
      if (building_list_chi.length > 0 && building_list_eng.length > 0) {
        mergeBuildingList();
        refreshUI();
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
    obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':building_list_eng[i]['Building name'].capitalize()};
    // Data bug, special handling temporarily
    //if (i > 1199 - 2) {
    //  obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':building_list_eng[i-1]['Building name'].capitalize()};
    //}
    //else if (i == 1199 - 2) {
    //  obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':''};
    //}
    //else {
    //  obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':building_list_eng[i]['Building name'].capitalize()};
    //}
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
    })
    building_list_dedup[i]['case'].sort();
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
    })
    map_dist[dist_ch]['case'].sort();
    // Append case count per district to district label
    $("#label-district-" + map_dist[dist_ch]['id'].toLowerCase()).append('<br/><span class="badge badge-secondary">' + map_dist[dist_ch]['case'].length + '</span>');
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
  /* Bootstrap 4 style grid as table */
  /* https://www.codeply.com/go/IDBemcEAyL */
  let html = '<div class="col-12 grid-striped table table-condensed table-hover table-striped" id="table-building">';

  if(typeof(data[0]) === 'undefined') {
    return null;
  } else {
    let keyword = $("#search-keyword").val().toLowerCase();
    let keyword_as_int = 0;
    if (keyword.isNumber()) {
      keyword_as_int = parseInt(keyword, 10);
    }
    $.each(data, function( index, row ) {
      if(index == 0) {
        html += '<div class="row py-2 font-weight-bold">';
        html += '<div class="col-3">';
        html += '日期<br/>Date';
        html += '</div>';
        html += '<div class="col-6">';
        html += '大廈名單<br/>Building name';
        html += '</div>';
        html += '<div class="col-3">';
        html += '個案<br/>Cases';
        html += '</div>';
        html += '</div>';
      }
      // 選擇 地區
      if (row['dist']['id'] == $('input[name="input-district"]:checked').val() &&
         (keyword == '' ||
          row['buil']['ch'].toLowerCase().includes(keyword) ||
          row['buil']['en'].toLowerCase().includes(keyword) ||
          (keyword_as_int > 0 && row['case'].includes(keyword_as_int)))) {
        html += '<div class="row py-2">';
        html += '<div class="col-3">';
        html += (row['date'] == '' ? '' : (moment(row['date'], 'YYYY-MM-DD').format('M月D日') + '<br/>' + moment(row['date'], 'YYYY-MM-DD').format('MMM Do')));
        html += '</div>';
        html += '<div class="col-6">';
        html += '<a href="http://maps.google.com/maps?q=' + row['buil']['ch'] + '+' + row['dist']['ch'] + '" target="_blank">' + row['buil']['ch'] + '</a>';
        html += '<br/>';
        html += '<a href="http://maps.google.com/maps?q=' + row['buil']['en'] + '+' + row['dist']['en'] + '" target="_blank">' + row['buil']['en'] + '</a>';
        html += '</div>';
        html += '<div class="col-3">';
        html += '<h4><a href="javascript:void(0)" data-toggle="tooltip" title="' + row['case'].join(', ') + '">';
        html += '<span class="badge badge-' + row['badge'] + '">' + row['case'].length + '</span>';
        html += '</a></h4>';
        html += '</div>';
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }
}
