var domain = [];
domain[0] = "https://colorpalette.ddns.net:8443/";
domain[1] = "https://covid-hk.github.io/";
var ajax_retry_times = 0;
var ajax_retry_times_max = domain.length - 1;

var unixtimestamp = Math.floor(Date.now() / 1000);
var unixtimestampper15mins = Math.floor(unixtimestamp / 1000);

var ajax_pending = [];
ajax_pending['building_list_chi'    ] = (1 << 0);
ajax_pending['building_list_eng'    ] = (1 << 1);
ajax_pending['case_details'         ] = (1 << 2);
ajax_pending['filetime'             ] = (1 << 3);
ajax_pending['googleapis_maps'      ] = (1 << 4);
ajax_pending['latest_reported_cases'] = (1 << 5);
ajax_pending['population'           ] = (1 << 6);

var csv_obj = [];
csv_obj['building_list_chi'    ] = [];
csv_obj['building_list_eng'    ] = [];
csv_obj['case_details'         ] = [];
csv_obj['filetime'             ] = [];
csv_obj['googleapis_maps'      ] = [];
csv_obj['latest_reported_cases'] = [];
csv_obj['population'           ] = [];

function isAjaxDone(file_list) {
  let result = 0;
  for (let i = 0; i < file_list.length; i++) {
    result = result | ajax_pending[file_list[i]];
  }
  return (result == 0 && file_list.length > 0);
}

function onCompleteAjax(file_name) {
  ajax_pending[file_name] = 0;
}

function getBuildingListCsv(callback) {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/building_list_chi.csv
  // https://www.chp.gov.hk/files/misc/building_list_eng.csv
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "building_list_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      csv_obj['building_list_chi'] = $.csv.toObjects(response);
      if (csv_obj['building_list_chi'].length > 0) {
        onCompleteAjax('building_list_chi');
        if (csv_obj['building_list_chi'].length == csv_obj['building_list_eng'].length) {
          callback();
        }
        // if list_chi & list_eng not match
        else if (ajax_retry_times < ajax_retry_times_max && isAjaxDone(['building_list_chi']) && isAjaxDone(['building_list_eng'])) {
          ++ajax_retry_times;
          getBuildingListCsv(callback);
        }
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListCsv(callback);
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListCsv(callback);
      }
    }
  });
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "building_list_eng.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      csv_obj['building_list_eng'] = $.csv.toObjects(response);
      if (csv_obj['building_list_eng'].length > 0) {
        onCompleteAjax('building_list_eng');
        if (csv_obj['building_list_chi'].length == csv_obj['building_list_eng'].length) {
          callback();
        }
        // if list_chi & list_eng not match
        else if (ajax_retry_times < ajax_retry_times_max && isAjaxDone(['building_list_chi']) && isAjaxDone(['building_list_eng'])) {
          ++ajax_retry_times;
          getBuildingListCsv(callback);
        }
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListCsv(callback);
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListCsv(callback);
      }
    }
  });
}

function getBuildingListChiCsv(callback) {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/building_list_chi.csv
  // https://www.chp.gov.hk/files/misc/building_list_eng.csv
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "building_list_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      csv_obj['building_list_chi'] = $.csv.toObjects(response);
      if (csv_obj['building_list_chi'].length > 0) {
        onCompleteAjax('building_list_chi');
        callback();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListChiCsv(callback);
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getBuildingListChiCsv(callback);
      }
    }
  });
}

function getCasesCsv(callback) {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/latest_situation_of_reported_cases_covid_19_chi.csv
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "latest_situation_of_reported_cases_covid_19_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      csv_obj['latest_reported_cases'] = $.csv.toObjects(response);
      if (csv_obj['latest_reported_cases'].length > 0) {
        onCompleteAjax('latest_reported_cases');
        callback();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getCasesCsv(callback);
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getCasesCsv(callback);
      }
    }
  });
}

function getCaseDetailsCsv(callback) {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/enhanced_sur_covid_19_chi.csv
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "enhanced_sur_covid_19_chi.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      csv_obj['case_details'] = $.csv.toObjects(response);
      if (csv_obj['case_details'].length > 0) {
        onCompleteAjax('case_details');
        callback();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getCaseDetailsCsv(callback);
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getCaseDetailsCsv(callback);
      }
    }
  });
}

function getFileTimeCsv(callback) {
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times] + "filetime.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      csv_obj['filetime'] = $.csv.toObjects(response);
      if (csv_obj['filetime'].length > 0) {
        onCompleteAjax('filetime');
        callback();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getFileTimeCsv(callback);
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getFileTimeCsv(callback);
      }
    }
  });
}

function getGoogleApisMapsCsv(callback) {
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times_max] + "googleapis_maps" + (ajax_retry_times == 0 ? "" : "") + ".csv?t=" + unixtimestamp,
    dataType: "text",
    success: function(response)
    {
      csv_obj['googleapis_maps'] = $.csv.toObjects(response);
      if (csv_obj['googleapis_maps'].length > 0) {
        onCompleteAjax('googleapis_maps');
        callback();
      }
      // if no result
      else if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getGoogleApisMapsCsv(callback);
      }
    },
    error: function()
    {
      if (ajax_retry_times < ajax_retry_times_max) {
        ++ajax_retry_times;
        getGoogleApisMapsCsv(callback);
      }
    }
  });
}

function getPopulationCsv(callback) {
  $.ajax({
    type: "GET",
    url: domain[ajax_retry_times_max] + "population2019.csv?t=" + unixtimestampper15mins,
    dataType: "text",
    success: function(response)
    {
      csv_obj['population'] = $.csv.toObjects(response);
      if (csv_obj['population'].length > 0) {
        onCompleteAjax('population');
        callback();
      }
      // if no result
      //else if (ajax_retry_times < ajax_retry_times_max) {
      //  ++ajax_retry_times;
      //  getPopulationCsv(callback);
      //}
    },
    error: function()
    {
      //if (ajax_retry_times < ajax_retry_times_max) {
      //  ++ajax_retry_times;
      //  getPopulationCsv(callback);
      //}
    }
  });
}
