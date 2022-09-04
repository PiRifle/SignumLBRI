import { compileFile } from "pug";
import axios from "axios";
import FormData from "form-data";
import fs from "fs"
import {Request, Response} from "express"
import { BookListing, BookListingDocument } from "../models/BookListing";
import { NativeError } from "mongoose";
import { BookDocument } from "../models/Book";
import { generateBarcode } from "./barcode";

export const showPDF = async (req: Request, res: Response)=>{
    var bookListings = (await BookListing.find({}).populate("bookOwner").populate("book"))
    bookListings = bookListings.map((value) => {
      value.barcode = generateBarcode(value._id);
      console.log(value.barcode)
      return value;
    });
    // console.log(bookListings);
    const bookDocument = compileFile("views/book/bookPrintDocument.pug");
    res.send(bookDocument({ bookListings: bookListings }));
}