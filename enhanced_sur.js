var case_details = [];

var case_per_date = [];
function groupCasesByDate() {
  for (let i = 0; i < case_details.length; i++) {
    if (case_details[i]['確診/疑似個案'] == '疑似') { continue; }
    let case_number = parseInt(case_details[i]['個案編號'], 10);
    let case_date = parseInt(moment(case_details[i]['報告日期'], 'DD/MM/YYYY').format('YYYYMMDD'), 10) - 20200000;
    case_per_date[case_date] = case_per_date[case_date] || [];
    case_per_date[case_date] = case_per_date[case_date].concat(case_number);
  }
}
function getLastDateCases() {
  let last_date_cases = [];
  if (case_per_date.length > 0) {
    last_date_cases = last_date_cases.concat(case_per_date[case_per_date.length - 1]);
  }
  // if ajax data list not ready yet, retry refreshUI
  else {
    //setTimeout(function(){
    //  refreshUI();
    //}, 2000);
  }
  return last_date_cases;
}

var caseCount = [];
function calAllCaseCount() {
  caseCount["確診"] = 0;
  caseCount["確診男"] = 0;
  caseCount["確診女"] = 0;
  caseCount["確診20歲以下"] = 0;
  caseCount["確診20-30歲"] = 0;
  caseCount["確診30-40歲"] = 0;
  caseCount["確診40-50歲"] = 0;
  caseCount["確診50-60歲"] = 0;
  caseCount["確診60-70歲"] = 0;
  caseCount["確診70-80歲"] = 0;
  caseCount["確診80歲以上"] = 0;
  caseCount["確診男20歲以下"] = 0;
  caseCount["確診男20-30歲"] = 0;
  caseCount["確診男30-40歲"] = 0;
  caseCount["確診男40-50歲"] = 0;
  caseCount["確診男50-60歲"] = 0;
  caseCount["確診男60-70歲"] = 0;
  caseCount["確診男70-80歲"] = 0;
  caseCount["確診男80歲以上"] = 0;
  caseCount["確診女20歲以下"] = 0;
  caseCount["確診女20-30歲"] = 0;
  caseCount["確診女30-40歲"] = 0;
  caseCount["確診女40-50歲"] = 0;
  caseCount["確診女50-60歲"] = 0;
  caseCount["確診女60-70歲"] = 0;
  caseCount["確診女70-80歲"] = 0;
  caseCount["確診女80歲以上"] = 0;
  caseCount["確診年紀最小"] = 200;
  caseCount["確診年紀最大"] = 0;
  caseCount["確診地區"] = 0;
  caseCount["確診地區港島"] = 0;
  caseCount["確診地區九龍西"] = 0;
  caseCount["確診地區九龍東"] = 0;
  caseCount["確診地區新界西"] = 0;
  caseCount["確診地區新界東"] = 0;
  caseCount["確診地區中西區"] = map_dist['中西區'].case.length;
  caseCount["確診地區灣仔區"] = map_dist['灣仔'].case.length;
  caseCount["確診地區東區"] = map_dist['東區'].case.length;
  caseCount["確診地區南區"] = map_dist['南區'].case.length;
  caseCount["確診地區深水埗區"] = map_dist['深水埗'].case.length;
  caseCount["確診地區油尖旺區"] = map_dist['油尖旺'].case.length;
  caseCount["確診地區九龍城區"] = map_dist['九龍城'].case.length;
  caseCount["確診地區觀塘區"] = map_dist['觀塘'].case.length;
  caseCount["確診地區黃大仙區"] = map_dist['黃大仙'].case.length;
  caseCount["確診地區西貢區"] = map_dist['西貢'].case.length;
  caseCount["確診地區沙田區"] = map_dist['沙田'].case.length;
  caseCount["確診地區大埔區"] = map_dist['大埔'].case.length;
  caseCount["確診地區北區"] = map_dist['北區'].case.length;
  caseCount["確診地區元朗區"] = map_dist['元朗'].case.length;
  caseCount["確診地區屯門區"] = map_dist['屯門'].case.length;
  caseCount["確診地區荃灣區"] = map_dist['荃灣'].case.length;
  caseCount["確診地區葵青區"] = map_dist['葵青'].case.length;
  caseCount["確診地區離島區"] = map_dist['離島'].case.length;

  for (let i = 0; i < case_details.length; i++) {
    if (case_details[i]['確診/疑似個案'] == '疑似') { continue; }

    let obj = {'sex':(case_details[i]['性別'] == '男' ? 'M' : case_details[i]['性別'] == '女' ? 'F' : ''), 'age':(case_details[i]['年齡'].isNumber() ? parseInt(case_details[i]['年齡'], 10) : -1)};
    caseCount["確診"]++;
    if(obj.sex == "M") {
      caseCount["確診男"]++;
    }
    else if(obj.sex == "F") {
      caseCount["確診女"]++;
    }
    if(obj.age >= 0) {
    if(obj.age < 20) {
      caseCount["確診20歲以下"]++;
      if(obj.sex == "M") {
        caseCount["確診男20歲以下"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女20歲以下"]++;
      }
    }
    if(obj.age >= 20 && obj.age < 30) {
      caseCount["確診20-30歲"]++;
      if(obj.sex == "M") {
        caseCount["確診男20-30歲"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女20-30歲"]++;
      }
    }
    if(obj.age >= 30 && obj.age < 40) {
      caseCount["確診30-40歲"]++;
      if(obj.sex == "M") {
        caseCount["確診男30-40歲"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女30-40歲"]++;
      }
    }
    if(obj.age >= 40 && obj.age < 50) {
      caseCount["確診40-50歲"]++;
      if(obj.sex == "M") {
        caseCount["確診男40-50歲"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女40-50歲"]++;
      }
    }
    if(obj.age >= 50 && obj.age < 60) {
      caseCount["確診50-60歲"]++;
      if(obj.sex == "M") {
        caseCount["確診男50-60歲"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女50-60歲"]++;
      }
    }
    if(obj.age >= 60 && obj.age < 70) {
      caseCount["確診60-70歲"]++;
      if(obj.sex == "M") {
        caseCount["確診男60-70歲"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女60-70歲"]++;
      }
    }
    if(obj.age >= 70 && obj.age < 80) {
      caseCount["確診70-80歲"]++;
      if(obj.sex == "M") {
        caseCount["確診男70-80歲"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女70-80歲"]++;
      }
    }
    if(obj.age >= 80) {
      caseCount["確診80歲以上"]++;
      if(obj.sex == "M") {
        caseCount["確診男80歲以上"]++;
      }
      else if(obj.sex == "F") {
        caseCount["確診女80歲以上"]++;
      }
    }
    if(caseCount["確診年紀最小"] > obj.age) {
      caseCount["確診年紀最小"] = obj.age;
    }
    if(caseCount["確診年紀最大"] < obj.age) {
      caseCount["確診年紀最大"] = obj.age;
    }
    }
  }

  caseCount["確診地區港島"] = caseCount["確診地區中西區"] + caseCount["確診地區灣仔區"] + caseCount["確診地區東區"] + caseCount["確診地區南區"];
  caseCount["確診地區九龍西"] = caseCount["確診地區深水埗區"] + caseCount["確診地區油尖旺區"];
  caseCount["確診地區九龍東"] = caseCount["確診地區九龍城區"] + caseCount["確診地區觀塘區"] + caseCount["確診地區黃大仙區"];
  caseCount["確診地區新界東"] = caseCount["確診地區西貢區"] + caseCount["確診地區沙田區"] + caseCount["確診地區大埔區"] + caseCount["確診地區北區"];
  caseCount["確診地區新界西"] = caseCount["確診地區元朗區"] + caseCount["確診地區屯門區"] + caseCount["確診地區荃灣區"] + caseCount["確診地區葵青區"] + caseCount["確診地區離島區"];
  caseCount["確診地區"] = caseCount["確診地區港島"] + caseCount["確診地區九龍西"] + caseCount["確診地區九龍東"] + caseCount["確診地區新界西"] + caseCount["確診地區新界東"];
}

function getCaseDetailsCsv() {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/enhanced_sur_covid_19_chi.csv
  let unixtimestamp = Math.floor(Date.now() / 1000);
  let unixtimestampper15mins = Math.floor(unixtimestamp / 1000);
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "enhanced_sur_covid_19_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      case_details = $.csv.toObjects(response);
      if (case_details.length > 0) {
        groupCasesByDate();
        calAllCaseCount();

        // Construct Case Bar Summary
        let html = constructCaseBarSummary();
        $('#case_bar_summary').html($(html).hide().fadeIn(2000));
        // Draw Bar Chart
        drawBarChart();

        // Construct Case Pie Summary
        html = constructCasePieSummary();
        $('#case_pie_summary').html($(html).hide().fadeIn(2000));
        // Draw Pie Chart
        drawPieChart();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getCaseDetailsCsv();
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getCaseDetailsCsv();
      }
    }
  });
}

$(document).ready(function(){
  setTimeout(function() {
    getCaseDetailsCsv();
  }, 1000);
});

function constructCaseBarSummary() {
  let html = '';
  //html += '<mark>';
  html += '<span>';
  html += '<i class="far fa-user"></i> ';
  html += '<span class="badge badge-light" style="font-size:100%;background-color:' + transparentize(window.chartColors.blue) + ';"><b>' + caseCount["確診男"] + '</b></span> 男';
  html += ' + ';
  html += '<span class="badge badge-info" style="font-size:100%;background-color:' + transparentize(window.chartColors.pink) + ';"><b>' + caseCount["確診女"] + '</b></span> 女';
  html += '</span>';
  //html += '</mark>';
  return html;
}

function constructCasePieSummary() {
  let html = '';
  //html += '<mark>';
  html += '<span>';
  html += '<i class="fas fa-map-marked-alt"></i> ';
  html += '過去14天內疑似/確診個案的地區分佈';
  html += '</span>';
  //html += '</mark>';
  return html;
}

function constructCaseDetailsModal($element) {
  let row = []; row['buil'] = []; row['dist'] = [];
  row['buil']['ch'] = $element.attr('data-buil-ch');
  row['buil']['en'] = $element.attr('data-buil-en');
  row['dist']['ch'] = $element.attr('data-dist-ch');
  row['dist']['en'] = $element.attr('data-dist-en');
  row['badge'] = $element.attr('data-badge');
  let cases = $element.attr('data-cases').split(',').map(Number);
  row['cases'] = cases;
  let header = constructCaseDetailsHeader(row);
  $('#caseDetailModal .modal-header .modal-title').html($(header).hide().fadeIn(2000));

  let data = case_details.filter(function(item, pos, self) {
    return cases.includes(parseInt(item['個案編號'], 10));
  });
  //data.sort();
  data.reverse();
  let table = constructCaseDetailsTable(data);
  $('#caseDetailModal .modal-body').html($(table).hide().fadeIn(2000));
}

function constructCaseDetailsHeader(row) {
  let html = '';
  html += '<a href="http://maps.google.com/maps?q=' + row['buil']['ch'] + '+' + row['dist']['ch'] + '" target="_blank"><i class="fas fa-map-marked-alt"></i>&nbsp;&nbsp;' + row['dist']['ch'] + ' ' + row['buil']['ch'] + '</a>';
  html += '<br/>';
  html += '<a href="http://maps.google.com/maps?q=' + row['buil']['en'] + '+' + row['dist']['en'] + '" target="_blank">' + row['buil']['en'] + ', ' + row['dist']['en'] + '</a>';
  html += '<br/>';
  html += '<span class="badge badge-' + row['badge'] + '" style="font-size:1.3em;">' + row['cases'].length + '</span>';
  return html;
}

function constructCaseDetailsTable(data) {
  let html = '<table class="table table-bordered table-condensed table-hover table-striped" id="table-casedetails">';

  if(typeof(data[0]) === 'undefined') {
    return null;
  } else {
    $.each(data, function( index, row ) {
      if(index == 0) {
        html += '<thead>';
        html += '<tr>';
        html += '<th>';
        html += '個案編號';
        html += '</th>';
        html += '<th>';
        html += '報告日期';
        html += '</th>';
        html += '<th>';
        html += '性別';
        html += '</th>';
        html += '<th>';
        html += '年齡';
        html += '</th>';
        html += '<th>';
        html += '狀況';
        html += '</th>';
        html += '<th>';
        html += '身份';
        html += '</th>';
        html += '<th>';
        html += '個案分類';
        html += '</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
      }
      html += '<tr>';
      html += '<td>';
      html += row["個案編號"];
      html += '</td>';
      html += '<td>';
      html += row["報告日期"];
      html += '</td>';
      html += '<td>';
      html += (row["性別"] == '' ? '' : row["性別"]);
      html += '</td>';
      html += '<td>';
      html += row["年齡"];
      html += '</td>';
      html += '<td>';
      html += row["住院/出院/死亡"];
      html += '</td>';
      html += '<td>';
      html += row["香港/非香港居民"];
      html += '</td>';
      html += '<td>';
      html += row["個案分類*"];
      html += '</td>';
      html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';
    return html;
  }
}
