import $ from "jquery";

$(document).ready(function () {
  var beforePrint = function () {
    // console.log('Functionality to run before printing.');
  };
  var afterPrint = async function () {
    const printFlag = await fetch(
      `/label/registerprints${window.location.search}`,
    );
    setTimeout(() => {
      if (printFlag.status == 200) {
        location.assign("/label/print/success");
      }
    }, 1000);
  };

  if (window.matchMedia) {
    var mediaQueryList = window.matchMedia("print");
    mediaQueryList.addListener(function (mql) {
      if (mql.matches) {
        beforePrint();
      } else {
        afterPrint();
      }
    });
  }

  window.onbeforeprint = beforePrint;
  window.onafterprint = afterPrint;
  print();
});
