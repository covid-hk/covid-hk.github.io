var domain = "https://covid-hk.github.io/"; //"https://covid-hk.github.io/";

$(document).ready(function() {
  getBuildingListCsv();
});

function getBuildingListCsv() {
  // https://data.gov.hk/tc-data/dataset/hk-dh-chpsebcddr-novel-infectious-agent
  // https://www.chp.gov.hk/files/misc/building_list_chi.csv
  // https://www.chp.gov.hk/files/misc/building_list_eng.csv
  $.ajax({
    type: "GET",
    url: domain + "building_list_chi.csv",
    dataType: "text",
    success: function(response)
    {
      let obj = $.csv.toObjects(response);
      console.log(obj);
    }
  });
  $.ajax({
    type: "GET",
    url: domain + "building_list_eng.csv",
    dataType: "text",
    success: function(response)
    {
      let obj = $.csv.toObjects(response);
      console.log(obj);
    }
  });
}
