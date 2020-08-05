var aggregatedCaseCount = [];
aggregatedCaseCount["確診"] = [];
aggregatedCaseCount["住院"] = [];
aggregatedCaseCount["死亡"] = [];
aggregatedCaseCount["出院"] = [];
aggregatedCaseCount["新增"] = [];

$(document).ready(function(){
  getCasesCsv(onReadyCsv);
});

function onReadyCasesDataInit() {
  calAggregatedCaseCount();

  // Construct Case Line Summary
  let html = constructCaseLineSummary();
  $('#case_line_summary').html($(html).hide().fadeIn(2000));
  // Draw Line Chart
  drawLineChart();
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

function getDateRange() {
  let dateRange = [];
  for (let i = 0; i < csv_obj['latest_reported_cases'].length; i++) {
    let d = csv_obj['latest_reported_cases'][i]['更新日期'];
    if (moment(d, 'DD/MM/YYYY') < new Date(2020,0,22)) { continue; }

    dateRange.push(moment(d, 'DD/MM/YYYY').format('MMM DD'));
  }
  return dateRange;
}

function calAggregatedCaseCount() {
  let tempAggregatedCaseCount = [];
  tempAggregatedCaseCount["確診"] = 0;
  tempAggregatedCaseCount["死亡"] = 0;
  tempAggregatedCaseCount["出院"] = 0;
  tempAggregatedCaseCount["新增"] = 0;
  for (let i = 0; i < csv_obj['latest_reported_cases'].length; i++) {
    let d = csv_obj['latest_reported_cases'][i]['更新日期'];
    if (moment(d, 'DD/MM/YYYY') < new Date(2020,0,22)) { continue; }

    tempAggregatedCaseCount["確診"] = csv_obj['latest_reported_cases'][i]['確診個案'];
    tempAggregatedCaseCount["死亡"] = csv_obj['latest_reported_cases'][i]['死亡'];
    tempAggregatedCaseCount["出院"] = csv_obj['latest_reported_cases'][i]['出院'];
    if (i > 0) {
      tempAggregatedCaseCount["新增"] = csv_obj['latest_reported_cases'][i]['確診個案'] - csv_obj['latest_reported_cases'][i-1]['確診個案'];
    }

    aggregatedCaseCount["死亡"].push(tempAggregatedCaseCount["死亡"]);
    aggregatedCaseCount["出院"].push(tempAggregatedCaseCount["出院"]);
    aggregatedCaseCount["新增"].push(tempAggregatedCaseCount["新增"]);
    aggregatedCaseCount["確診"].push(tempAggregatedCaseCount["確診"]);
    aggregatedCaseCount["住院"].push(tempAggregatedCaseCount["確診"] - tempAggregatedCaseCount["死亡"] - tempAggregatedCaseCount["出院"] - tempAggregatedCaseCount["新增"]);
  }
}

function constructCaseLineSummary() {
  let update_date = csv_obj['latest_reported_cases'][csv_obj['latest_reported_cases'].length - 1]['更新日期'];
  let confirmed = aggregatedCaseCount["確診"][aggregatedCaseCount["確診"].length - 1];
  let discharge = aggregatedCaseCount["出院"][aggregatedCaseCount["出院"].length - 1];
  let death = aggregatedCaseCount["死亡"][aggregatedCaseCount["死亡"].length - 1];
  let hospitalised = aggregatedCaseCount["住院"][aggregatedCaseCount["住院"].length - 1];
  let added = aggregatedCaseCount["新增"][aggregatedCaseCount["新增"].length - 1];
  let html = '';
  html += '<span>';
  html += '<i class="far fa-clock"></i> 更新日期: ' + moment(update_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
  html += ' | ';
  html += '<i class="fas fa-ambulance"></i> ';
  html += '<span class="badge badge-info" style="font-size:100%;background-color:' + transparentize(window.chartColors.pink) + ';"><b>' + added + '</b></span> 新增';
  html += ' + ';
  html += '</span>';
  html += '<br/><br/>';
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
        label: '新增 New',
        backgroundColor: transparentize(window.chartColors.pink),
        borderColor: window.chartColors.pink,
        borderWidth: 1,
        data: aggregatedCaseCount["新增"]
      }, {
        hidden: true,
        type: "bar",
        label: '出院 Discharge',
        backgroundColor: transparentize(window.chartColors.green),
        borderColor: window.chartColors.green,
        borderWidth: 1,
        data: aggregatedCaseCount["出院"]
      }, {
        hidden: true,
        type: "bar",
        label: '死亡 Death',
        backgroundColor: transparentize(window.chartColors.black),
        borderColor: window.chartColors.black,
        borderWidth: 1,
        data: aggregatedCaseCount["死亡"]
      }, {
        hidden: true,
        type: "bar",
        label: '住院 Hospitalised',
        backgroundColor: transparentize(window.chartColors.orange),
        borderColor: window.chartColors.orange,
        borderWidth: 1,
        data: aggregatedCaseCount["住院"]
      }, {
        hidden: true,
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

function drawBarChart() {
  let ctx = document.getElementById( "case_bar_chart" ),
  line_chart = new Chart(ctx, {
    type: "horizontalBar",
    data: {
      labels: ["80-"+caseCount["確診年紀最大"]+"歲", "70-79歲", "60-69歲", "50-59歲", "40-49歲", "30-39歲", "20-29歲", ""+caseCount["確診年紀最小"]+"-19歲"],
      datasets: [{
        label: '男',
        backgroundColor: transparentize(window.chartColors.blue),
        borderColor: window.chartColors.blue,
        borderWidth: 1,
        data: [caseCount["確診男80歲以上"], caseCount["確診男70-80歲"], caseCount["確診男60-70歲"], caseCount["確診男50-60歲"], caseCount["確診男40-50歲"], caseCount["確診男30-40歲"], caseCount["確診男20-30歲"], caseCount["確診男20歲以下"]]
      }, {
        label: '女',
        backgroundColor: transparentize(window.chartColors.pink),
        borderColor: window.chartColors.pink,
        borderWidth: 1,
        data: [caseCount["確診女80歲以上"], caseCount["確診女70-80歲"], caseCount["確診女60-70歲"], caseCount["確診女50-60歲"], caseCount["確診女40-50歲"], caseCount["確診女30-40歲"], caseCount["確診女20-30歲"], caseCount["確診女20歲以下"]]
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

function drawPieChart() {
  let ctx = document.getElementById( 'case_pie_chart' ).getContext('2d');
  pie_chart = new Chart(ctx, {
    //type: 'pie',
    type: 'doughnut',
    data: {
      labels: [
        '新界東',
        '九龍東',
        '港島',
        '九龍西',
        '新界西',
      ],
      datasets: [{
        label: '患者確診期間曾經出入地區',
        labels: [
          '新界東',
          '九龍東',
          '港島',
          '九龍西',
          '新界西',
        ],
        data: [
          caseCount["確診地區新界東"],
          caseCount["確診地區九龍東"],
          caseCount["確診地區港島"],
          caseCount["確診地區九龍西"],
          caseCount["確診地區新界西"],
        ],
        backgroundColor: [
          window.chartColors.東鐵綫,
          window.chartColors.觀塘綫,
          window.chartColors.港島綫,
          window.chartColors.荃灣綫,
          window.chartColors.西鐵綫,
        ],
        datalabels: {
          //anchor: 'end',
          anchor: 'center',
          //backgroundColor: null,
          //borderWidth: 0,
          //anchor: 'start',
          clamp: true,
        }
      }, {
        labels: [
          '北區',
          '大埔區',
          '沙田區',
          '西貢區',
          '黃大仙區',
          '觀塘區',
          '九龍城區',
          '東區',
          '灣仔區',
          '中西區',
          '南區',
          '油尖旺區',
          '深水埗區',
          '機場及離島區',
          '葵青區',
          '荃灣區',
          '屯門區',
          '元朗區',
        ],
        data: [
          caseCount["確診地區北區"],
          caseCount["確診地區大埔區"],
          caseCount["確診地區沙田區"],
          caseCount["確診地區西貢區"],
          caseCount["確診地區黃大仙區"],
          caseCount["確診地區觀塘區"],
          caseCount["確診地區九龍城區"],
          caseCount["確診地區東區"],
          caseCount["確診地區灣仔區"],
          caseCount["確診地區中西區"],
          caseCount["確診地區南區"],
          caseCount["確診地區油尖旺區"],
          caseCount["確診地區深水埗區"],
          caseCount["確診地區離島區"],
          caseCount["確診地區葵青區"],
          caseCount["確診地區荃灣區"],
          caseCount["確診地區屯門區"],
          caseCount["確診地區元朗區"],
        ],
        backgroundColor: [
          window.chartColors.東鐵綫,
          window.chartColors.東鐵綫,
          window.chartColors.東鐵綫,
          window.chartColors.將軍澳綫,
          window.chartColors.觀塘綫,
          window.chartColors.觀塘綫,
          window.chartColors.屯馬綫,
          window.chartColors.港島綫,
          window.chartColors.港島綫,
          window.chartColors.港島綫,
          window.chartColors.南港島綫,
          window.chartColors.荃灣綫,
          window.chartColors.荃灣綫,
          window.chartColors.東涌綫,
          window.chartColors.東涌綫,
          window.chartColors.西鐵綫,
          window.chartColors.西鐵綫,
          window.chartColors.西鐵綫,
        ],
        datalabels: {
          display: false,
        }
      }]
    },
    options: {
      responsive: true,
      legend: {
        display: false
      },
      tooltips: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem, data) {
            var dataset = data.datasets[tooltipItem.datasetIndex];
            var index = tooltipItem.index;
            if (dataset.data.length <= 5) { return dataset.labels[index]; }
            return dataset.labels[index] + ': ' + dataset.data[index];
          }
        }
      },
      plugins: {
        datalabels: {
          backgroundColor: function(context) {
            return context.dataset.backgroundColor;
          },
          borderColor: 'white',
          borderRadius: 25,
          borderWidth: 2,
          clamp: true,
          color: 'white',
          display: true,
          font: {
            weight: 'bold'
          },
          formatter: function(value, context) {
            let total = context.chart.data.datasets[0].data.reduce((a,b)=>a+b,0);
            return Math.round(value/total*100) + '%' + ' ' + context.chart.data.labels[context.dataIndex];
          }
        }
      }
    }
  });
}
