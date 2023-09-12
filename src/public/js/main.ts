import { registerPerformance } from "./performance"
import { sendError } from "./error"
import { detectMobile } from "./utils/detectMobile"
const usingTailwind = [...document.querySelector("body")!.classList].includes("using-tailwindcss")
if(usingTailwind){
  console.log("loading tailwindcss scripts")
  import(/* webpackChunkName: "tailwinduiengine" */ "tw-elements").then(({ Toast,  Animate, Dropdown, initTE })=>{initTE({ Dropdown, Toast, Animate })})
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

if (container && (navigator as any).gpu){
  console.log("loading webrenderer")
  import(/* webpackChunkName: "webgl" */ "./webrender").then(({setupRenderer})=>{setupRenderer()}).catch((error) => {
    console.log(error)
  })
};

//@ts-ignore
window.rmbook = function rmbook(event: any) {
  $(event).parent().parent().remove();
};


const isMobile = detectMobile()

window.addEventListener("error", (ev)=>sendError("","",0,0,ev.error))

$(document).ready(async function () {
  const setupBarcode = isMobile && !usingTailwind ? (await import(/* webpackChunkName: "barcode" */"./barcode/utils")).setupBarcodeScanner : function(...args:any[]){return async function(...args:any[]){}}
  const instantiateScan = setupBarcode()
  $(document).on("input", ".numeric", function () {
    this.value = this.value.replace(/\D/g, "");
  });
  registerPerformance(usingTailwind)
  $("#currency").maskMoney();
  $("#currency").on("change", (change: any) => {
    $("#currencyFormated").val($("#currency").maskMoney("unmasked")[0]);
  });
  $("button.scan-barcode").on("click", async (target: any) => {
    await instantiateScan(onScanSuccess);
  });
  $("button.scan-barcode-addToCart").on("click", async (target: any) => {
    await instantiateScan(onScanAdd, true);
  });
  function onScanSuccess(decodedText: string, decodedResult: any) {
    $("input[name='itemID']").val(decodedText);
    $('form[action="/find"]').trigger("submit");
}
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
  $(".dataLoad").removeClass("hidden");
  let bookDataFetch = await fetch(
    `/book/fromisbn?isbn=${$("input[name='isbn']").val()}`,
    { credentials: "same-origin" },
  );
  $(".dataLoad").addClass("hidden");

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
    $('input[name = "publisher"]').val(bookData.publisher).parent().attr("data-val-loaded", "")
    $('input[name = "authors"]').val(bookData.authors.join(", ")).parent().attr("data-val-loaded", "")
    $('input[name = "pubDate"]').val(bookData.pubDate).parent().attr("data-val-loaded", "")
    $('input[name = "title"]').val(bookData.title).parent().attr("data-val-loaded", "")
    $("img.bookCover").attr("src", bookData.image).attr("data-val-loaded", "")
  } else {
    $('input[name = "publisher"]').parent().attr("data-val-loaded", "")
    $('input[name = "authors"]').parent().attr("data-val-loaded", "")
    $('input[name = "pubDate"]').parent().attr("data-val-loaded", "")
    $('input[name = "title"]').parent().attr("data-val-loaded", "")
  }
}
$("button.sellBooks").on("click", (e: any) => {
  let ids: string[] = [];
  let costs: number[] = [];
  $(isMobile ? ".sellMobile > ul" : "table.sellTable > tbody")
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
        if (isMobile){
          if (!$(`li[data-book-id="${resp._id}"]`)[0]){
            $(".sellMobile > ul").append(`
            <li class="row py-2 ${resp.status != "accepted" && "bg-danger"}" data-book-id="${resp._id}" data-book-cost="${Math.ceil(resp.cost + resp.commission)}" >
              <div class="col">
                <h5>${shorten(resp.book.title, 40)}</h5>
                <p>Publisher: ${shorten(resp.book.title, 40)}</p>
                Status: ${resp.status} <br> ID: ${resp._id}
                <h6>Price: ${(resp.cost + resp.commission).toLocaleString("pl-PL", {style: "currency",currency: "PLN",})}</h6>
              </div>
              <div class="col-4">
                <button class="btn btn-danger rmBook" onclick="window.rmbook(this)">Usuń</button>
              </div>
              <hr>
            </li>
            `)
          }
        }else{
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
      }
      $(event.target).trigger("focus");
    }
  });
});
