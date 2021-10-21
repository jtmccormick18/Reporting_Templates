var CreatePDFfromHTML = function (filename, report_type) {
  console.log("clicked", { filename });
  $(".table").addClass("no-borders");
  $("tr").addClass("no-borders");
  $("td").addClass("no-borders");
  var element = $(".html-content").get(0);

  if (!report_type || report_type == 1) {
    var opt = {
      margin: 1,
      filename: (filename || "default") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
      pagebreak: { mode: "avoid-all", after: "#SOA_Tax" },
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
  } else if (report_type == 2) {
    $(".html-content").css({ overflow: "visible !important" });
    var opt = {
      margin: 1,
      filename: (filename || "default") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        type: "view",
        // height: element.scrollHeight,
        // width:element.scrollWidth + 20,
        onrendered: function (canvas) {
          let canvasData = canvas.toDataURL();
          console.log(canvasData);
          // $("body").css({"width": "-="+after});
        },
      },
      jsPDF: { unit: "pt", format: "a2", orientation: "landscape" },
      // pagebreak: { mode: "avoid-all", after: "#SOA_Tax" },
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).toCanvas().toPdf().save();
    $(".html-content").css({ overflow: "scroll" });
  } else if (report_type == 3 || report_type == 4) {
    $("title_card_row").addClass("m-0");
    $("title_row").addClass("m-0");
    var opt = {
      margin: 1,
      filename: (filename || "default") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a3", orientation: "portrait" },
      pagebreak: { mode: "avoid-all", after: "#UNDEVELOPED" },
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();

    $("title_card_row").addClass("m-0");
    $("title_row").addClass("m-0");
  }

  $(".table").removeClass("no-borders");
  $("tr").removeClass("no-borders");
  $("td").removeClass("no-borders");
  return;
};

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
  //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData != "object" ? JSON.parse(JSONData) : JSONData;
  var CSV = "";
  //This condition will generate the Label/Header
  if (ShowLabel) {
    var row = "";

    //This loop will extract the label from 1st index of on array
    for (var index in arrData[0]) {
      //Now convert each value to string and comma-seprated
      row += index + ",";
    }
    row = row.slice(0, -1);
    //append Label row with line break
    CSV += row + "\r\n";
  }

  //1st loop is to extract each row
  for (var i = 0; i < arrData.length; i++) {
    var row = "";
    //2nd loop will extract each column and convert it in string comma-seprated
    for (var index in arrData[i]) {
      row += '"' + arrData[i][index] + '",';
    }
    row.slice(0, row.length - 1);
    //add a line break after each row
    CSV += row + "\r\n";
  }

  if (CSV == "") {
    alert("Invalid data");
    return;
  }

  //this trick will generate a temp "a" tag
  var link = document.createElement("a");
  link.id = "lnkDwnldLnk";

  //this part will append the anchor tag and remove it after automatic click
  document.body.appendChild(link);

  var csv = CSV;
  blob = new Blob([csv], { type: "text/csv" });
  var csvUrl = window.webkitURL.createObjectURL(blob);
  var filename = (ReportTitle || "UserExport") + ".csv";
  $("#lnkDwnldLnk").attr({
    download: filename,
    href: csvUrl,
  });

  $("#lnkDwnldLnk")[0].click();
  document.body.removeChild(link);
}

var countyid;
var tvcrefid;
var parcelyear;
var districts;
var ReportType;

$("#ddlCounty").on("change", function () {
  ddlCountyChange().then(() => loadDistricts());
});

function ddlCountyChange() {
  return new Promise((resolve) => {
    var selectedCounty = $("#ddlCounty").val();
    if (selectedCounty == 0) {
      var county = $("#ddlCounty");
      var countyfull = 0;
      setComboBox("/Service/GetAllCounty", { id: countyfull }, county).then(function () {
        resolve();
      });
    } else {
      var tvctext = $("#ddltvc option:selected").text();
      var tvc = $("#ddltvc");
      if (selectedCounty != null && selectedCounty != "") {
        AtiService.Get("/Service/GetIndexTvcofCounty", {
          id: selectedCounty,
        }).then(function (data) {
          tvc.empty();
          if (data != null && !jQuery.isEmptyObject(data)) {
            $.each(data, function (i, x) {
              tvc.append(
                $("<option/>", {
                  value: x.Value,
                  text: x.Text,
                })
              );
            });
          }
          if ($("#ddltvc option:contains(" + tvctext + ")").length) {
            $("#ddltvc option:contains(" + tvctext + ")").attr("selected", "selected");
          }
          resolve();
        });
      }
    }
  });
}

$("#ddltvc").on("change", function () {
  /*  ddltvcChange().then(() => loadDistricts());*/
  ddltvcChange();
});

function ddltvcChange() {
  return new Promise((resolve) => {
    var tvc = $("#ddltvc").val();
    if (tvc == "A") {
      showloader();
      var tvc = $("#ddltvc");
      var tvcfull = 0;
      setComboBox("/Service/GetIndexTvcofCounty", { id: tvcfull }, tvc).then(function () {
        $("#ddlCounty").val("").trigger("change.select2");
        hideloader();
        resolve();
      });
    } else if (tvc == 0) {
      /* return;*/
      resolve();
    } else {
      var tvcname = $("#ddltvc option:selected").text();
      var county = $("#ddlCounty");
      var district = $("#ddlDistrict");
      var countytext = $("#ddlCounty option:selected").text();
      var districttext = $("#ddlDistrict option:selected").text();
      AtiService.Get("/Service/GetIndexCounty", { tvcname: tvcname }).then(function (data) {
        if (data != null && !jQuery.isEmptyObject(data)) {
          county.empty();
          if (data.length == 2) {
            county.append(
              $("<option/>", {
                value: data[1].Value,
                text: data[1].Text,
              })
            );
            county.append(
              $("<option/>", {
                value: data[0].Value,
                text: data[0].Text,
              })
            );
            loadDistricts().then(function () {
              if ($("#ddlCounty option:contains(" + countytext + ")").length) {
                $("#ddlCounty option:contains(" + countytext + ")").attr("selected", "selected");
                let countyselected = $("#ddlCounty").val();
                $("#ddlCounty").val(countyselected).trigger("change.select2");
              }
              resolve();
            });
          } else {
            county.append(
              $("<option />", {
                value: "",
                text: "Select County",
              })
            );
            $.each(data, function (i, x) {
              county.append(
                $("<option/>", {
                  value: x.Value,
                  text: x.Text,
                })
              );
            });
            if ($("#ddlCounty option:contains(" + countytext + ")").length) {
              $("#ddlCounty option:contains(" + countytext + ")").attr("selected", "selected");
              let countyselected = $("#ddlCounty").val();
              $("#ddlCounty").val(countyselected).trigger("change.select2");
            }
            resolve();
          }
        }
      });
    }
  });
}

$("#ddlparcelyear").on("change", function () {
  loadDistricts();
});

function loadDistricts() {
  return new Promise((resolve) => {
    var ddlDistrict = $("#ddlDistrict");
    var county = $("#ddlCounty").val() === null || $("#ddlCounty").val() === "" ? 0 : $("#ddlCounty").val();
    var tvc = $("#ddltvc").val() === null || $("#ddltvc").val() === "" ? 0 : $("#ddltvc").val();
    if (tvc == "A") {
      tvc = "0";
    }
    // var parcelyear =
    //   $("#ddlparcelyear").val() === null || $("#ddlparcelyear").val() === ""
    //     ? 0
    //     : $("#ddlparcelyear").val();
    setComboBoxDefault("/Service/GetIndexDistrictOfTvc", { tvcid: tvc, county_id: county }, ddlDistrict).then(function () {
      console.log("change", ddlDistrict.find("option").length);
      ddlDistrict.prop("disabled", !ddlDistrict.find("option").length);
      resolve();
    });
  });
}

const validateReportForm = function () {
  const val = $("#ddlDistrict").val();
  console.log("function called", { val });
  if ($("#ddlDistrict").val() == null || $("#ddlDistrict").val() == "") {
    alert("District(s) is required!");
    return false;
  }
};

function HomecheckInvertoryOrSale() {
  if ($("#ddlparcelyear").val() == 0) {
    $("#labeltag").addClass("taglabel labelblue");
    $("#labeltag").removeClass("labelred");
    $("#labeltag").html("Sale File");
  } else if ($("#ddlBegYos").val() == 0) {
    $("#labeltag").addClass("taglabel labelred");
    $("#labeltag").removeClass(" labelblue");
    $("#labeltag").html("Inventory File");
  }
}
function layoutInventoryOrSale() {
  if ($("#parcel_yearinventory").text() == 0) {
    $("#labeltag").addClass("taglabel labelblue");
    $("#labeltag").removeClass("labelred");
    $("#labeltag").html("Sale File");
  } else {
    $("#labeltag").addClass("taglabel labelred");
    $("#labeltag").removeClass(" labelblue");
    $("#labeltag").html("Inventory File");
  }
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  console.log({ ca });
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

getCookie();

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function setvalues() {
  countyid = $("#ddlCounty").val() === null || $("#ddlCounty").val() === "" ? "0" : $("#ddlCounty").val();
  tvcrefid = $("#ddltvc").val() === null || $("#ddltvc").val() === "" ? "0" : $("#ddltvc").val();
  districts = $("#ddlDistrict").val() === null || $("#ddlDistrict").val() === "" ? "0" : $("#ddlDistrict").val();
  parcelyear = $("#ddlparcelyear").val() === null || $("#ddlparcelyear").val() === "" ? "0" : $("#ddlparcelyear").val();
  ReportType = $("#ddlReportType").val() === null || $("#ddlReportType").val() === "" ? "0" : $("#ddlReportType").val();
}

$(document).ready(function () {
  var resResultHeight = "240px";
  $(window)
    .resize(function () {
      if (window.innerWidth > 1400) {
        resResultHeight = "550px";
      }
    })
    .resize();

  if (window.innerWidth > 1400) {
    resResultHeight = "550px";
  }

  //$('#ddlDistrict').multiselect({
  //    includeSelectAllOption: true
  //});

  $("#ddlCounty").val(countyid).trigger("change.select2");
  $("#ddltvc").val(tvcrefid).trigger("change.select2");
  $("#ddlparcelyear").val(parcelyear).trigger("change.select2");
  $("#ddlReportType").val(ReportType).trigger("change.select2");
  $("#ddlDistrict").val(districts).trigger("change.select2");

  // HomecheckInvertoryOrSale();
  // layoutInventoryOrSale();

  if (window.location.pathname == "/Reports/ReportDetails" || window.location.pathname == "/Reports/Reports") {
    $("#labeltag").addClass("taglabel labelred");
    $("#labeltag").removeClass("labelblue");
    $("#labeltag").html("Report Module");
  }

  console.log("here", window.location.pathname);
  // if (
  //   window.location.pathname == "/" ||
  //   window.location.pathname == "/Home/Index/"
  // ) {
  //   $("#labeltag").css("display", "none");
  // }
  var height =
    parseInt($(document).height()) - parseInt($(".layout_head").height()) - parseInt($(".homesearch").height()) - 200;

  $(window).resize(function () {
    $(".dataTables_scrollBody").height(
      parseInt($(document).height()) - parseInt($(".layout_head").height()) - parseInt($(".homesearch").height()) - 200
    );
    $(".grid").height(parseInt($("#results_wrapper").height() + 50));
  });

  setvalues();
});
//// End of document.ready function
