if([...document.querySelector("body")!.classList].includes("using-tailwindcss")){
  console.log("loading tailwindcss scripts")
  import(/* webpackChunkName: "tailwinduiengine" */ "tw-elements").then(({ Toast, Dropdown, initTE })=>{initTE({ Dropdown, Toast,  })})
}else{
  console.log("loading bootstrap scripts")
  import(/* webpackChunkName: "popper" */"@popperjs/core");
  import(/* webpackChunkName: "bootstrap" */"bootstrap");
}
import $ from "jquery";
//@ts-ignore
import maskMoney from "./lib/maskMoney";
maskMoney($);
//@ts-ignore
window.JQuery = $;

const container = document.querySelector('.book-render')
if (container){
  console.log("loading webrenderer")
  import(/* webpackChunkName: "webgl" */ "./webrender").then(({setupRenderer})=>{setupRenderer()}).catch((error) => {
    console.log(error)
  })
};

//@ts-ignore
window.rmbook = function rmbook(event: any) {
  // console.log(event);

  $(event).parent().parent().remove();
};
// const $ = require("jquery");
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats
} from "html5-qrcode";
import { Html5QrcodeResult } from "html5-qrcode/esm/core";
var isMobile = false; //initiate as false
// device detection
if (
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent,
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
    navigator.userAgent.substr(0, 4),
  )
) {
  isMobile = true;
}
let barcodeDetector: any;
let reader: Html5Qrcode;
function onScanSuccess(decodedText: string, decodedResult: any) {
  // handle the scanned code as you like, for example:
  if (reader) {
    reader.stop();
  }
  $("input[name='itemID']").val(decodedText);
  $('form[action="/find"]').trigger("submit");
}
//@ts-ignore
const formatsToSupport = [Html5QrcodeSupportedFormats.EAN_13];
let config = {
  fps: 10,
  // qrbox: { width: 250, height: 250 },
  formatsToSupport: formatsToSupport,
  // supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
};

if (isMobile) {
  if (!("BarcodeDetector" in window)) {
    reader = new Html5Qrcode("reader");
    // alert("Uwaga! Będziesz używać eksperymentalnego skanera kodów!")
    console.log(
      "Barcode Detector is not supported by this browser! Using legacy",
    );
  } else {
    console.log("Barcode Detector supported!");

    // create new detector
    //@ts-ignore
    barcodeDetector = new BarcodeDetector({
      formats: ["ean_13"],
    });
  }
}

$(document).ready(function () {
  $(document).on("input", ".numeric", function () {
    this.value = this.value.replace(/\D/g, "");
  });
  const timeStart = Date.now();
  $("a")
    .not(".no-override")
    .on("click", (event: any) => {
      const navigateToHREF = new URL(
        location.origin + event.target.getAttribute("href"),
      );
      if (navigateToHREF.origin == location.origin) {
        let params = new URLSearchParams(navigateToHREF.search);
        params.set("performance", (Date.now() - timeStart).toString());
        navigateToHREF.search = params.toString();
        $(event.target).attr("href", navigateToHREF.toString());
      }
    });
  $("form").on("submit", (event: any) => {
    var element = document.createElement("input");
    element.setAttribute("name", "performance");
    element.setAttribute("value", (Date.now() - timeStart).toString());
    element.classList.add("d-none");
    event.target.append(element);
  });
  $("#currency").maskMoney();
  $("#currency").on("change", (change: any) => {
    $("#currencyFormated").val($("#currency").maskMoney("unmasked")[0]);
  });
  async function instantiateScan(
    callback: (decodedText: string, result: Html5QrcodeResult) => void,
  ) {
    if (barcodeDetector) {
      let mediaStream: MediaStream | undefined;
      if ($("#reader").parent().hasClass("d-none")) {
        $("#reader").append("<h6>USING PRFL ENGINE</h6>");
        $("#reader").parent().removeClass("d-none");
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        const video = document.createElement("video");
        video.srcObject = mediaStream;
        video.autoplay = true;
        video.style.width = "100%";
        $("#reader").append(video);
        async function detect() {
          if (barcodeDetector) {
            try {
              const read = await barcodeDetector
                .detect(video)
                .catch(console.error);
              if (read) {
                console.log(read);
                return read[0].rawValue;
              }
            } catch (e) {}
          }
        }
        (async function renderLoop() {
          const val = await detect();
          if (!val) {
            requestAnimationFrame(renderLoop);
          } else {
            callback(val, {} as unknown as Html5QrcodeResult);
          }
        })();

        //mount VideoFeed
      } else {
        //unmount VideoFeed
        $("#reader").parent().addClass("d-none");
        $("#reader").children().remove();
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }
      }
    }
    if (reader) {
      //@ts-ignore
      if (reader.getState() == Html5QrcodeScannerState.NOT_STARTED) {
        $("#reader").parent().removeClass("d-none");
        reader.start({ facingMode: "environment" }, config, callback, () => {});
      } else {
        reader.stop();
        $("#reader").parent().addClass("d-none");
      }
    }
  }
  $("button.scan-barcode").on("click", async (target: any) => {
    await instantiateScan(onScanSuccess);
  });
  $("button.scan-barcode-addToCart").on("click", async (target: any) => {
    await instantiateScan(onScanAdd);
  });
  async function onScanAdd(decodedText: string, decodedResult: any) {
    $("input[name='itemIDSell']").val(decodedText);
    $("input[name='itemIDSell']").blur();
    $("button.scan-barcode-addToCart").click();
  }
  $("input[name='itemID']").focus();
  $(window).on(
    "keydown",
    function (event: { keyCode: number; preventDefault: () => void }) {
      if (event.keyCode == 13) {
        if ($("input[name='itemID']").is(":focus")) {
          // $("input[name='itemID']").blur();
          return true;
        } else {
          if ($("input[name='isbn']").is(":focus")) {
            event.preventDefault();
            $("input[name='isbn']").blur();
            return false;
          }
          return true;
        }
      }
    },
  );
  $(window).on(
    "keydown",
    function (event: { keyCode: number; preventDefault: () => void }) {
      if (event.keyCode == 13) {
        if ($("input[name='itemIDSell']").is(":focus")) {
          event.preventDefault();
          $("input[name='itemIDSell']").blur();
          return false;
        }
        return true;
      }
    },
  );
  $("input[name='isbn']").on("focusout", (event: any) => {
    castData();
  });
});
async function castData() {
  $(".dataLoad").removeClass("d-none");
  let bookDataFetch = await fetch(
    `/book/fromisbn?isbn=${$("input[name='isbn']").val()}`,
    { credentials: "same-origin" },
  );
  $(".dataLoad").addClass("d-none");
  $(".dataLoad").parent().addClass("d-none");

  if (bookDataFetch.status == 200) {
    let bookData: {
      title: string;
      publisher: string;
      authors: string[];
      pubDate: number;
      isbn: number;
      image: string;
      msrp: number;
    } = await bookDataFetch.json();
    $('input[name = "publisher"]')
      .val(bookData.publisher)
      .removeClass("d-none");
    $('input[name = "authors"]')
      .val(bookData.authors.join(", "))
      .removeClass("d-none");
    $('input[name = "pubDate"]').val(bookData.pubDate).removeClass("d-none");
    $('input[name = "title"]').val(bookData.title).removeClass("d-none");
    $("img.bookCover").attr("src", bookData.image).removeClass("d-none");
  } else {
    $('input[name = "publisher"]').removeClass("d-none");
    $('input[name = "authors"]').removeClass("d-none");
    $('input[name = "pubDate"]').removeClass("d-none");
    $('input[name = "title"]').removeClass("d-none");
  }
}
$("button.sellBooks").on("click", (e: any) => {
  let ids: string[] = [];
  let costs: number[] = [];
  $("table.sellTable > tbody")
    .children()
    .each((index, element) => {
      const elem = element.getAttribute("data-book-id");
      const cost = element.getAttribute("data-book-cost");

      if (elem) {
        ids.push(elem);
      }
      if (cost) {
        costs.push(Number(cost));
      }
    });
  $("input#IDS_BOOK").val(JSON.stringify(ids));
  $("span#costSum").text(
    costs
      .reduce((partialSum, a) => partialSum + a, 0)
      .toLocaleString("pl-PL", {
        style: "currency",
        currency: "PLN",
      }),
  );
});
function shorten(value: string, char: number) {
  return value.length > char ? value.substring(0, char - 3) + "..." : value;
}
$("input[name='itemIDSell']").on("focusout", (event: any) => {
  fetch(`/listingJSON?itemID=${event.target.value}`).then(async (value) => {
    event.target.value = "";
    if (value.status == 200) {
      const resp = await value.json();
      if (resp) {
        if (!$(`tr[data-book-id="${resp._id}"]`)[0]) {
          $("table.sellTable > tbody").append(`
            <tr data-book-id="${resp._id}" data-book-cost="${Math.ceil(
              resp.cost + resp.commission,
            )}" ${resp.status != "accepted" ? "class='bg-danger'" : undefined}>
              <td>${resp._id}</td>
              <td>${shorten(resp.book.title, 40)}</td>
              <td>${shorten(resp.book.publisher, 80)}</td>
              <td>${(resp.cost + resp.commission).toLocaleString("pl-PL", {
                style: "currency",
                currency: "PLN",
              })}</td>
              <td>${resp.status}</td>
              <td>
                <button onclick="window.rmbook(this)" class="btn btn-danger rmBook">Usuń</button>
              </td>
            </tr>
          `);
        }
      }
      $(event.target).trigger("focus");
    }
  });
});
// function deleteBook(){
// }
// function sellBook(){
//   fetch(location.href+"/sell", {method: "POST"})
// }
