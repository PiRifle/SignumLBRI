import { fetchBook } from "../util/findBook"
import { Request, Response } from "express"
import { Book, BookDocument } from "../models/Book"
import { NativeError } from "mongoose"
export async function getFillBookData(req: Request, res: Response){
    console.log("GOT PINGED by "+req.rawHeaders)
    const isbn = Number(req.query.isbn)
    Book.findOne({isbn: isbn}, async (err: NativeError, book: BookDocument) =>{
        if (err) throw err;
        if(book){
            const bookData = book
            res.json(bookData)
        }else{
            const bookData = await fetchBook(isbn)
            const book = new Book({
                title: bookData.title,
                publisher: bookData.publisher,
                authors: bookData.authors,
                pubDate: bookData.pubDate,
                isbn: bookData.isbn,
                image: bookData.image,
                msrp: bookData.msrp,
            })
            book.save(err=>{console.log(err)})
            res.json(bookData)
        }
    })
    // res.json()
}
// export async function postBook