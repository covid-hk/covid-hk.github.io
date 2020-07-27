var case_details = [];

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
        // TODO
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

function constructCaseDetailsModal($element) {
  let row = []; row['buil'] = []; row['dist'] = [];
  row['buil']['ch'] = $element.attr('data-buil-ch');
  row['buil']['en'] = $element.attr('data-buil-en');
  row['dist']['ch'] = $element.attr('data-dist-ch');
  row['dist']['en'] = $element.attr('data-dist-en');
  let header = constructCaseDetailsHeader(row);
  $('#caseDetailModal .modal-header .modal-title').html($(header).hide().fadeIn(2000));

  let cases = $element.attr('data-cases').split(',').map(Number);
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
  html += '<a href="http://maps.google.com/maps?q=' + row['buil']['ch'] + '+' + row['dist']['ch'] + '" target="_blank"><i class="fas fa-map-marked-alt"></i> ' + row['dist']['ch'] + ' ' + row['buil']['ch'] + '</a>';
  html += '<br/>';
  html += '<a href="http://maps.google.com/maps?q=' + row['buil']['en'] + '+' + row['dist']['en'] + '" target="_blank">' + row['buil']['en'] + ', ' + row['dist']['en'] + '</a>';
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
        html += '住院/出院/死亡';
        html += '</th>';
        html += '<th>';
        html += '香港/非香港居民';
        html += '</th>';
        html += '<th>';
        html += '個案分類*';
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
