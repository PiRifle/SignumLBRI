import { JSDOM } from "jsdom";

async function fetchBook(
  isbn: number,
): Promise<{
  title: string;
  isbn: number;
  authors: string[];
  publisher: string;
  pubDate: number;
  msrp: number;
  image: string;
} | null> {
  const searchUrl = new URL("https://www.podrecznikowo.pl/search.php");
  console.log("Searching ", isbn);

  searchUrl.searchParams.set("s", isbn.toString());
  searchUrl.searchParams.set("t", "4");
  console.log("downloading Website ", isbn);
  const bookRequest = await fetch(searchUrl);
  const webpage = await bookRequest.text();
  const searchDOM = new JSDOM(webpage);
  const selectedBook = searchDOM.window.document
    .querySelector("div.main")
    .querySelectorAll("div.item")[0];
  // console.log(selectedBook);
  if (selectedBook != null) {
    const offerLink = selectedBook
      .querySelector("div.name > a")
      .getAttribute("href");
    const bookURL = new URL("https://www.podrecznikowo.pl/" + offerLink);
    console.log("fetching book ", isbn);
    const bookInfoRequest = await fetch(bookURL);
    const webpage = await bookInfoRequest.text();
    const bookDOM = new JSDOM(webpage);
    const document = bookDOM.window.document;
    const image =
      "https://www.podrecznikowo.pl" +
      document.querySelector("a.book > img").getAttribute("src");
    console.log("fetching image ", isbn);
    const imgFetch = await fetch(new URL(image)).catch((err) =>
      console.log(err),
    );
    let imgBody = "";
    if (imgFetch) {
      imgBody = `data:${imgFetch.headers.get(
        "content-type",
      )};base64,${Buffer.from(await imgFetch.arrayBuffer()).toString(
        "base64",
      )}`;
    }
    const info = document.querySelector("div.textbook");
    let authors: string[] = [""];
    let publisher = "";
    let pubDate = 0;
    try {
      authors = info
        .querySelectorAll("h2")[0]
        .textContent.split(":")[1]
        .split(",");
    } catch (e) {}
    try {
      publisher = info.querySelectorAll("span")[3].textContent;
    } catch (e) {}
    try {
      pubDate = Number(
        info.querySelectorAll("span")[1].childNodes[8].textContent,
      );
    } catch (e) {}
    // console.log({
    //     title: info.querySelector("span").textContent,
    //     isbn: Number(info.querySelectorAll("span")[2].textContent),
    //     authors: authors,
    //     publisher: publisher,
    //     pubDate: pubDate,
    //     msrp: Number(document.querySelector("span[itemprop='price']").textContent.replace(",", ".")),
    //     image: imgBody
    // });
    return {
      title: info.querySelector("span").textContent,
      isbn: Number(info.querySelectorAll("span")[2].textContent),
      authors: authors,
      publisher: publisher,
      pubDate: pubDate,
      msrp: Number(
        document
          .querySelector("span[itemprop='price']")
          .textContent.replace(",", "."),
      ),
      image: imgBody,
    };

    // console.log(webpage)
  } else {
    return null;
  }
}

export { fetchBook };
