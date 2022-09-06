import { fetchBook } from "../util/findBook";
import { NextFunction, Request, Response } from "express";
import { Book, BookDocument } from "../models/Book";
import { NativeError } from "mongoose";
import { check, validationResult } from "express-validator";
import { BookOwner } from "../models/BookOwner";
import { BookOwnerDocument } from "../models/BookOwner";
import { BookListing, BookListingDocument } from "../models/BookListing";
import { UserDocument } from "../models/User";
export async function getFillBookData(req: Request, res: Response) {
  await check("isbn").isLength({ min: 13 }).isNumeric().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log("GOT PINGED by " + req.rawHeaders);
  
  const isbn = Number(req.query.isbn);
  Book.findOne({ isbn: isbn }, async (err: NativeError, book: BookDocument) => {
    if (err) throw err;
    if (book) {
      const bookData = book;
      res.json(bookData);
    } else {
      const bookData = await fetchBook(isbn);
      if (!bookData) return res.status(404).end();
      const book = new Book({
        title: bookData.title,
        publisher: bookData.publisher,
        authors: bookData.authors,
        pubDate: bookData.pubDate,
        isbn: bookData.isbn,
        image: bookData.image,
        msrp: bookData.msrp,
      });
      book.save((err) => {
        console.log(err);
      });
      res.json(bookData);
    }
  });
  // res.json()
}
export async function getSellBook(req: Request, res: Response) {
  res.render("book/sell", {
    title: "Sprzedaj Książkę",
  });
}
export async function getBooks(req: Request, res: Response) {
    var bookListings = await BookListing.find({}, "-__v -createdAt -updatedAt")
      .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
      .populate("book", "-_id -__v -createdAt -updatedAt")
      .populate("putOnSaleBy", "name email")
      .populate("soldBy", "name email")
    res.json(bookListings)
}

export async function postSellBookApp(req: Request, res: Response) {
  await check("isbn").isLength({ min: 13 }).isNumeric().run(req);
  await check("name").exists().run(req);
  await check("surname").exists().run(req);
  await check("email").exists().run(req);
  await check("phone").exists().run(req);
  await check("isbn").exists().run(req);
  await check("title").exists().run(req);
  await check("cost").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var sellingData = req.body;
  Book.findOne(
    { isbn: req.body.isbn },
    async (err: NativeError, book: BookDocument) => {
      if (!book) {
        book = new Book({
          title: sellingData.title,
          publisher: sellingData.publisher || "",
          authors: sellingData.authors.split(",") || [""],
          pubDate: sellingData.pubDate || "",
          isbn: sellingData.isbn,
          image: sellingData.image || "",
          msrp: sellingData.msrp || 0,
        });
        book.save();
      }
      BookOwner.findOne(
        { phone: sellingData.phone },
        (err: NativeError, user: BookOwnerDocument) => {
          if (!user) {
            user = new BookOwner({
              name: sellingData.name,
              surname: sellingData.surname,
              phone: sellingData.phone,
              email: sellingData.email,
            });
            user.save();
          }
          const bookListing = new BookListing({
            book: book.id,
            bookOwner: user.id,
            commission: Number(sellingData.commission),
            cost: Number(sellingData.cost),
            putOnSaleBy: req.user,
          });
          bookListing.save((err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                msg: err,
              });
            } else {
              return res.json({msg: "added_item_to_db"})
            }
          });
        }
      );
    }
  );
}

export async function postSellBook(req: Request, res: Response) {
  await check("isbn").isLength({ min: 13 }).isNumeric().run(req);
  await check("name").exists().run(req);
  await check("surname").exists().run(req);
  await check("email").exists().run(req);
  await check("phone").exists().run(req);
  await check("isbn").exists().run(req);
  await check("title").exists().run(req);
  await check("cost").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var sellingData = req.body;
  Book.findOne(
    { isbn: req.body.isbn },
    async (err: NativeError, book: BookDocument) => {
      if (!book) {
        book = new Book({
          title: sellingData.title,
          publisher: sellingData.publisher || "",
          authors: sellingData.authors.split(",") || [""],
          pubDate: sellingData.pubDate || "",
          isbn: sellingData.isbn,
          image: sellingData.image || "",
          msrp: sellingData.msrp || 0,
        });
        book.save();
      }
      BookOwner.findOne(
        { phone: sellingData.phone },
        (err: NativeError, user: BookOwnerDocument) => {
          if (!user) {
            user = new BookOwner({
              name: sellingData.name,
              surname: sellingData.surname,
              phone: sellingData.phone,
              email: sellingData.email,
            });
            user.save();
          }
          const bookListing = new BookListing({
            book: book.id,
            bookOwner: user.id,
            commission: Number(sellingData.commission),
            cost: Number(sellingData.cost),
            putOnSaleBy: req.user
          })
          bookListing.save((err)=>{
            if(err){
                console.log(err)
                req.flash("errors", {
                    msg: err
                });
                return res.redirect("/")
            }else{ 
                req.flash("success", {
                    msg: `Dodano zlecenie do bazy!`,
                  });
                return res.redirect("/")
            }
          })

        }
      );
    }
  );
}

export async function getFindListing(req: Request, res: Response) {
  await check("itemID").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      req.flash("errors", errors.array());
      return res.redirect("/");
  }
  var itemId = req.query.itemID
  var bookListings = await BookListing.find({_id: itemId}, "-__v -createdAt -updatedAt")
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
  res.render("book/showBooks", { bookListings: bookListings, edit: true });
}
export async function getFindListingApp(req: Request, res: Response) {
  await check("itemID").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  var bookListings = await BookListing.find(
    { _id: req.query.itemID },
    "-__v -createdAt -updatedAt"
  )
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
    res.json(bookListings);
}
export async function getBookRegistry(req: Request, res: Response, next: NextFunction){

  var bookListings = await BookListing.find({}, "-__v -createdAt -updatedAt")
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
  res.render("book/showBooks", {bookListings: bookListings})
}
// export async function postBook
export async function editBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  await check("itemID").isLength({ min: 12 }).isNumeric().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  var bookListings = await BookListing.findOne(
    { _id: req.params.itemID },
    "-__v -createdAt -updatedAt"
  )
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt")
    .populate("putOnSaleBy")
    .populate("soldBy")
    res.render("book/editBook", { item: bookListings, edit: true });
}

export async function sellBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
    await check("itemID").isLength({ min: 12 }).isNumeric().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/");
    }
    var bookListings = await BookListing.findOne(
      { _id: req.params.itemID },
      "-__v -createdAt -updatedAt"
    )
      .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
      .populate("book", "-_id -__v -createdAt -updatedAt");
    bookListings.sold = true
    bookListings.soldBy = (req.user as UserDocument)
    bookListings.save((err)=>{
        if(err){
            console.log(err)
            req.flash("errors", {
                msg: err
            });
            return res.redirect("/book/"+req.params.itemID);
        }else{ 
            req.flash("success", {msg:"Udało się! Sprzedanio książkę!"});
            return res.redirect("/book/"+req.params.itemID);
        }
    })
    

}
export async function sellBookApp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  await check("itemID").isLength({ min: 12 }).isNumeric().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  var bookListings = await BookListing.findOne(
    { _id: req.params.itemID },
    "-__v -createdAt -updatedAt"
  )
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
  bookListings.sold = true;
  bookListings.soldBy = req.user as UserDocument;
  bookListings.save((err) => {
    if (err) {
      console.log(err);
        return res.status(500).json({ msg: err });
    } else {
          return res.json({ msg: "success_sold_book" });
    }
  });
}
