$(document).ready(function() {
  $("input[name='itemID']").focus()
  $(window).on("keydown", function (event: { keyCode: number; preventDefault: () => void; }) {
    if (event.keyCode == 13) {
      if($("input[name='itemID']").is(":focus")){
        // $("input[name='itemID']").blur();
        return true;
      }else{
        event.preventDefault();
        $("input[name='isbn']").blur();
      };
      
      return false;
    }
  });
  // Place JavaScript code here...
  $("input[name='isbn']").on("focusout", (event)=>{
    console.log(event.target)
    castData()
  })

});
async function castData(){
  let bookDataFetch = await fetch(`/book/fromisbn?isbn=${$("input[name='isbn']").val()}`);
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
    $('input[name = "publisher"]').val(bookData.publisher);
    $('input[name = "authors"]').val(bookData.authors.join(", "));
    $('input[name = "pubDate"]').val(bookData.pubDate);
    $('input[name = "title"]').val(bookData.title);
    $('img.bookCover').attr("src", bookData.image);
  }
}

function deleteBook(){
  let url = new URL(location.href)
  url.
  fetch()
}
function sellBook(){

}