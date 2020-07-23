var domain = "https://covid-hk.github.io/"; //"https://covid-hk.github.io/";
var building_list_chi = [];
var building_list_eng = [];
var building_list = [];
var building_list_dedup = [];

var map_dist = [];
map_dist['北區'] = {'ch':'北區', 'en':'North', 'id':'N'};
map_dist['大埔'] = {'ch':'大埔', 'en':'Tai Po', 'id':'TP'};
map_dist['沙田'] = {'ch':'沙田', 'en':'Sha Tin', 'id':'ST'};
map_dist['西貢'] = {'ch':'西貢', 'en':'Sai Kung', 'id':'SK'};
map_dist['屯門'] = {'ch':'屯門', 'en':'Tuen Mun', 'id':'TM'};
map_dist['元朗'] = {'ch':'元朗', 'en':'Yuen Long', 'id':'YL'};
map_dist['荃灣'] = {'ch':'荃灣', 'en':'Tsuen Wan', 'id':'TW'};
map_dist['葵青'] = {'ch':'葵青', 'en':'Kwai Tsing', 'id':'KNT'};
map_dist['離島'] = {'ch':'離島', 'en':'Islands', 'id':'IS'};
map_dist['油尖旺'] = {'ch':'油尖旺', 'en':'Yau Tsim Mong', 'id':'YTM'};
map_dist['深水埗'] = {'ch':'深水埗', 'en':'Sham Shui Po', 'id':'SSP'};
map_dist['九龍城'] = {'ch':'九龍城', 'en':'Kowloon City', 'id':'KC'};
map_dist['黃大仙'] = {'ch':'黃大仙', 'en':'Wong Tai Sin', 'id':'WTS'};
map_dist['觀塘'] = {'ch':'觀塘', 'en':'Kwun Tong', 'id':'KT'};
map_dist['中西區'] = {'ch':'中西區', 'en':'Central & Western', 'id':'CNW'};
map_dist['灣仔'] = {'ch':'灣仔', 'en':'Wan Chai', 'id':'WC'};
map_dist['東區'] = {'ch':'東區', 'en':'Eastern', 'id':'E'};
map_dist['南區'] = {'ch':'南區', 'en':'Southern', 'id':'S'};

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

$(document).ready(function() {
  getBuildingListCsv();
});

function refreshUI() {
  $('#wrapper-table-building').hide();
  $('#wrapper-table-building-loading').show();
  let html = getBuildingListTable(building_list_dedup);
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
    url: domain + "building_list_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      building_list_chi = $.csv.toObjects(response);
      if (building_list_chi.length > 0 && building_list_eng.length > 0) {
        mergeBuildingList();
        refreshUI();
      }
    }
  });
  $.ajax({
    type: "GET",
    url: domain + "building_list_eng.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      building_list_eng = $.csv.toObjects(response);
      if (building_list_chi.length > 0 && building_list_eng.length > 0) {
        mergeBuildingList();
        refreshUI();
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
    building_list_dedup[i]['case'].sort();
  }
}

function getBuildingListTable(data) {
  /* Bootstrap 4 style grid as table */
  /* https://www.codeply.com/go/IDBemcEAyL */
  let html = '<div class="col-12 grid-striped table table-condensed table-hover table-striped" id="table-building">';

  if(typeof(data[0]) === 'undefined') {
    return null;
  } else {
    //data.reverse(); // sort
    $.each(data, function( index, row ) {
      if(index == 0) {
        html += '<div class="row py-2 font-weight-bold">';
        html += '<div class="col-3">';
        html += '地區<br/>District';
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
      if (row['dist']['id'] == $('input[name="input-district"]:checked').val()) {
        html += '<div class="row py-2">';
        html += '<div class="col-3">';
        html += row['dist']['ch'] + '<br/>' + row['dist']['en'];
        html += '</div>';
        html += '<div class="col-6">';
        html += '<a href="http://maps.google.com/maps?q=' + row['buil']['ch'] + '+' + row['dist']['ch'] + '" target="_blank">' + row['buil']['ch'] + '</a>';
        html += '<br/>';
        html += '<a href="http://maps.google.com/maps?q=' + row['buil']['en'] + '+' + row['dist']['en'] + '" target="_blank">' + row['buil']['en'] + '</a>';
        html += '</div>';
        html += '<div class="col-3">';
        html += '<h4><a href="javascript:void(0)" data-toggle="tooltip" title="' + row['case'].join(', ') + '">';
        if (row['case'].length > 9) {
          html += '<span class="badge badge-danger">' + row['case'].length + '</span>';
        }
        else if (row['case'].length > 2) {
          html += '<span class="badge badge-warning">' + row['case'].length + '</span>';
        }
        else {
          html += '<span class="badge badge-info">' + row['case'].length + '</span>';
        }
        html += '</a></h4>';
        html += '</div>';
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }
}
