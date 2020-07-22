var domain = "https://covid-hk.github.io/"; //"https://covid-hk.github.io/";
var building_list_chi = [];
var building_list_eng = [];
var building_list = [];

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
        showBuildingListTable(building_list);
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
        showBuildingListTable(building_list);
      }
    }
  });
}

function mergeBuildingList() {
  building_list = [];
  let i = 0;
  for (i = 0; i < building_list_chi.length; i++) {
    let obj = [];
    obj['dist'] = map_dist[building_list_chi[i]['地區']];
    obj['buil'] = {'ch':building_list_chi[i]['大廈名單'], 'en':building_list_eng[i]['Building name'].capitalize()};
    obj['type'] = map_type['住宅'];
    if (obj['buil']['ch'].includes('非住宅')) {
      obj['buil']['ch'] = obj['buil']['ch'].replace(' (非住宅)', '');
      obj['buil']['en'] = obj['buil']['en'].replace(' (non-residential)', '');
      obj['type'] = map_type['非住宅'];
    }
    obj['date'] = building_list_chi[i]['最後個案居住日期'];
    obj['case'] = building_list_chi[i]['相關疑似/確診個案'];
    building_list.push(obj);
  }
}

function showBuildingListTable(data) {
  var html = '<table class="table table-condensed table-hover table-striped" id="table-building">';

  if(typeof(data[0]) === 'undefined') {
    return null;
  } else {
    //data.reverse();
    $.each(data, function( index, row ) {
      if(index == 0) {
        html += '<thead>';
        html += '<tr>';
        html += '<th>';
        html += '地區<br/>District';
        html += '</th>';
        html += '<th>';
        html += '大廈名單<br/>Building name';
        html += '</th>';
        html += '<th>';
        html += '類別<br/>Type';
        html += '</th>';
        //html += '<th>';
        //html += '最後個案居住日期<br/>Last date of residence of the case(s)';
        //html += '</th>';
        html += '<th>';
        html += '相關疑似/確診個案<br/>Related probable/confirmed cases';
        html += '</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
      }
      html += '<tr>';
      html += '<td>';
      html += row['dist']['ch'] + '<br/>' + row['dist']['en'];
      html += '</td>';
      html += '<td>';
      html += '<a href="http://maps.google.com/maps?q=' + row['buil']['ch'] + '+' + row['dist']['ch'] + '" target="_blank">' + row['buil']['ch'] + '</a>';
      html += '<br/>';
      html += '<a href="http://maps.google.com/maps?q=' + row['buil']['en'] + '+' + row['dist']['en'] + '" target="_blank">' + row['buil']['en'] + '</a>';
      html += '</td>';
      html += '<td>';
      html += row['type']['ch'] + '<br/>' + row['type']['en'];
      html += '</td>';
      //html += '<td>';
      //html += row['date'];
      //html += '</td>';
      html += '<td>';
      html += row['case'];
      html += '</td>';
      html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';
    $('#wrapper-table-building').append(html);
  }
}
