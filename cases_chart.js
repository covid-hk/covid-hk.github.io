var latest_reported_cases = [];

function getCasesCsv() {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/latest_situation_of_reported_cases_covid_19_chi.csv
  let unixtimestamp = Math.floor(Date.now() / 1000);
  let unixtimestampper15mins = Math.floor(unixtimestamp / 1000);
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "latest_situation_of_reported_cases_covid_19_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      latest_reported_cases = $.csv.toObjects(response);
      if (latest_reported_cases.length > 0) {
        calAggregatedCaseCount();
        // Construct Case Summary
        let html = constructCaseSummary();
        $('#case_summary').html($(html).hide().fadeIn(2000));
        // Draw Line Chart
        drawLineChart();
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getCasesCsv();
      }
    }
  });
}

function getDateRange() {
  let dateRange = [];
  for (let i = 0; i < latest_reported_cases.length; i++) {
    let d = latest_reported_cases[i]['更新日期'];
    dateRange.push(moment(d, 'DD/MM/YYYY').format('MMM DD'));
  }
  return dateRange;
}

var aggregatedCaseCount = [];
aggregatedCaseCount["確診"] = [];
aggregatedCaseCount["住院"] = [];
aggregatedCaseCount["死亡"] = [];
aggregatedCaseCount["出院"] = [];
function calAggregatedCaseCount() {
  let tempAggregatedCaseCount = [];
  tempAggregatedCaseCount["確診"] = 0;
  tempAggregatedCaseCount["死亡"] = 0;
  tempAggregatedCaseCount["出院"] = 0;
  for (let i = 0; i < latest_reported_cases.length; i++) {
    tempAggregatedCaseCount["確診"] = latest_reported_cases[i]['確診個案'];
    tempAggregatedCaseCount["死亡"] = latest_reported_cases[i]['死亡'];
    tempAggregatedCaseCount["出院"] = latest_reported_cases[i]['出院'];

    aggregatedCaseCount["死亡"].push(tempAggregatedCaseCount["死亡"]);
    aggregatedCaseCount["出院"].push(tempAggregatedCaseCount["出院"]);
    aggregatedCaseCount["確診"].push(tempAggregatedCaseCount["確診"]);
    aggregatedCaseCount["住院"].push(tempAggregatedCaseCount["確診"] - tempAggregatedCaseCount["死亡"] - tempAggregatedCaseCount["出院"]);
  }
}

window.chartColors = {
  red: '#d9534f',
  orange: '#f0ad4e',
  yellow: 'rgb(255, 205, 86)',
  green: '#5cb85c',
  blue: '#337ab7',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
  light_blue: '#5bc0de',
  pink: '#EB2690',
  black: '#454545',
  // https://zh.wikipedia.org/wiki/Template:港鐵顏色/doc
  荃灣綫: '#ff0000',
  觀塘綫: '#1a9431',
  港島綫: '#0860a8',
  將軍澳綫: '#6b208b',
  東涌綫: '#fe7f1d',
  迪士尼綫: '#f550a6',
  機場快綫: '#1c7670',
  東鐵綫: '#5eb6e4',
  西鐵綫: '#a40084',
  屯馬綫: '#9a3b26',
  南港島綫: '#b5bd00'
};

function transparentize(color, opacity) {
  let alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return Color(color).alpha(alpha).rgbString();
}

window.onload = function() {
  setTimeout(function() {
    getCasesCsv();
  }, 1000);
};

function constructCaseSummary() {
  let update_date = latest_reported_cases[latest_reported_cases.length - 1]['更新日期'];
  let confirmed = latest_reported_cases[latest_reported_cases.length - 1]["確診個案"];
  let discharge = latest_reported_cases[latest_reported_cases.length - 1]["出院"];
  let death = latest_reported_cases[latest_reported_cases.length - 1]["死亡"];
  let hospitalised = confirmed - discharge - death;
  let html = '';
  html += '<span>(最後更新日期: ' + moment(update_date, 'DD/MM/YYYY').format('YYYY-MM-DD') + ')</span>';
  html += '<br/>';
  //html += '<mark>';
  html += '<span>';
  html += '<i class="far fa-user"></i> ';
  html += '<span class="badge badge-light" style="font-size:100%;background-color:' + transparentize(window.chartColors.green) + ';"><b>' + discharge + '</b></span> 出院';
  html += ' + ';
  html += '<span class="badge badge-info" style="font-size:100%;background-color:' + transparentize(window.chartColors.black) + ';"><b>' + death + '</b></span> 死亡';
  html += ' + ';
  html += '<span class="badge badge-light" style="font-size:100%;background-color:' + transparentize(window.chartColors.orange) + ';"><b>' + hospitalised + '</b></span> 住院';
  html += ' = ';
  html += '<span class="badge badge-info" style="font-size:100%;background-color:' + transparentize(window.chartColors.pink) + ';"><b>' + confirmed + '</b></span> 確診';
  html += '</span>';
  //html += '</mark>';
  return html;
}

function drawLineChart() {
  let ctx = document.getElementById( "case_line_chart" ),
  line_chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: getDateRange(),
      datasets: [{
        type: "bar",
        label: '出院 Discharge',
        backgroundColor: transparentize(window.chartColors.green),
        borderColor: window.chartColors.green,
        borderWidth: 1,
        data: aggregatedCaseCount["出院"]
      }, {
        type: "bar",
        label: '死亡 Death',
        backgroundColor: transparentize(window.chartColors.black),
        borderColor: window.chartColors.black,
        borderWidth: 1,
        data: aggregatedCaseCount["死亡"]
      }, {
        type: "bar",
        label: '住院 Hospitalised',
        backgroundColor: transparentize(window.chartColors.orange),
        borderColor: window.chartColors.orange,
        borderWidth: 1,
        data: aggregatedCaseCount["住院"]
      }, {
        type: "line",
        label: '確診 Confirmed',
        backgroundColor: transparentize(window.chartColors.pink),
        borderColor: window.chartColors.pink,
        borderWidth: 1,
        data: aggregatedCaseCount["確診"],
        fill: false
      }]
    },
    options: {
      title: {
        display: false,
        text: ''
      },
      tooltips: {
        mode: 'index',
        intersect: false
      },
      responsive: true,
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true }]
      },
      plugins: {
        datalabels: {
          display: false
        }
      }
    }
  });
}
