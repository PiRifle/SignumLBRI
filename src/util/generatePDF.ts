// import { compileFile } from "pug";
// import {Request, Response} from "express";
// import { BookListing} from "../models/BookListing";
// import { generateBarcode } from "./barcode";

// export const showPDF = async (req: Request, res: Response): Promise<void> =>{
//     let bookListings = (await BookListing.find({}).populate("bookOwner").populate("book"));
//     bookListings = bookListings.map((value) => {
//       value.barcode = generateBarcode(value._id);
//       console.log(value.barcode);
//       return value;
//     });
//     // console.log(bookListings);
//     const bookDocument = compileFile("views/book/bookIdentifier.pug");
//     res.send(bookDocument({ bookListings: bookListings }));
// };
