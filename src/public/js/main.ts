$(document).ready(function() {
  $("input[name='itemID']").focus()
  $(window).on("keydown", function (event: { keyCode: number; preventDefault: () => void; }) {
    if (event.keyCode == 13) {
      if($("input[name='itemID']").is(":focus")){
        // $("input[name='itemID']").blur();
        return true;
      }else{
        if($("input[name='isbn']").is(":focus")){
          event.preventDefault();
          $("input[name='isbn']").blur();
          return false
        }
        return true
      };
    }
  });
  // Place JavaScript code here...
  $("input[name='isbn']").on("focusout", (event)=>{
    console.log(event.target)
    castData()
  })

});
async function castData(){
  $('.dataLoad').removeClass("d-none")
  let bookDataFetch = await fetch(
    `/book/fromisbn?isbn=${$("input[name='isbn']").val()}`,
    { credentials: "same-origin" }
  );
  $(".dataLoad").parent().addClass("d-none");
  if(bookDataFetch.status == 200){
    let bookData: {
      title: string;
      publisher: string;
      authors: string[];
      pubDate: number;
      isbn: number;
      image: string;
      msrp: number;
    } = await bookDataFetch.json();
    $('input[name = "publisher"]').val(bookData.publisher).removeClass("d-none");
    $('input[name = "authors"]').val(bookData.authors.join(", ")).removeClass("d-none");
    $('input[name = "pubDate"]').val(bookData.pubDate).removeClass("d-none");
    $('input[name = "title"]').val(bookData.title).removeClass("d-none");
    $("img.bookCover").attr("src", bookData.image).removeClass("d-none");
  }else{
    console.log('aaa')
    $('input[name = "publisher"]').removeClass("d-none");
    $('input[name = "authors"]').removeClass("d-none");
    $('input[name = "pubDate"]').removeClass("d-none");
    $('input[name = "title"]').removeClass("d-none");
  }
}

// function deleteBook(){
// }
// function sellBook(){
//   fetch(location.href+"/sell", {method: "POST"})
// }