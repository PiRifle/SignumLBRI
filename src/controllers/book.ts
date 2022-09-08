import { fetchBook } from "../util/findBook";
import e, { NextFunction, Request, Response } from "express";
import { Book, BookDocument } from "../models/Book";
import { NativeError } from "mongoose";
import { check, validationResult } from "express-validator";
import { Buyer } from "../models/Buyer";
import { BuyerDocument } from "../models/Buyer";
import { BookListing, BookListingDocument, Label, LabelDocument} from "../models/BookListing";
import { User, UserDocument } from "../models/User";
import { Next } from "koa";
import { userInfo } from "os";
import { generateBarcode } from "../util/barcode";
export async function getFillBookData(req: Request, res: Response): Promise<Response<never>> {
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
      let book: BookDocument; 
      if (bookData){
        book = new Book({
          title: bookData.title,
          publisher: bookData.publisher,
          authors: bookData.authors,
          pubDate: bookData.pubDate,
          isbn: bookData.isbn,
          image: bookData.image,
          msrp: bookData.msrp,
        });
      }else{
        book = new Book({
          isbn: isbn,
        });
      }
      book.save((err) => {
        console.log(err);
      });
      if (!bookData){
        return res.status(404).end();
      } 
      res.json(bookData);
    }
  });
  // res.json()
}
export async function getSellBook(req: Request, res: Response): Promise<void> {
  res.render("book/sell", {
    title: "Sprzedaj Książkę",
  });
}
export async function getBooks(req: Request, res: Response): Promise<void> {
    const bookListings = await BookListing.find({}, "-__v -createdAt -updatedAt")
      .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
      .populate("book", "-_id -__v -createdAt -updatedAt")
      .populate("putOnSaleBy", "name email")
      .populate("soldBy", "name email");
    res.json(bookListings);
}

export async function postSellBookApp(req: Request, res: Response): Promise<Response<never>> {
  await check("isbn").isLength({ min: 13 }).isNumeric().run(req);
  await check("name").exists().run(req);
  await check("surname").exists().run(req);
  await check("email", "Email is not valid").isEmail().run(req);
  await check("phone").isMobilePhone("pl-PL").run(req);
  await check("isbn").exists().run(req);
  await check("title").exists().run(req);
  await check("cost").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const sellingData = req.body;
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
      Buyer.findOne(
        { phone: sellingData.phone },
        (err: NativeError, user: BuyerDocument) => {
          if (!user) {
            user = new Buyer({
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
              return res.json({msg: "added_item_to_db"});
            }
          });
        }
      );
    }
  );
}
export async function postSellBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<unknown> {  
  await check("isbn", "kod ISBN nie jest ważny").isLength({ min: 13 }).isNumeric().run(req);
  await check("title", "Nie podano tytułu książki").exists().run(req);
  await check("publisher", "Nie podano wydawcy książki").exists().run(req);
  await check("cost", "Nie podano ceny lub złą wartość").exists().isNumeric().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  const sellingData = req.body;
  console.log(sellingData);
  
  Book.findOne(
    { isbn: req.body.isbn },
    (err: NativeError, book: BookDocument) => {
      if (err) {
        next(err)
      }
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
        book.save((err: Error)=>{
          next(err)
        })
      } else if (!book.title) {
        book.title = sellingData.title;
        book.publisher = sellingData.publisher || "";
        book.authors = sellingData.authors.split(",") || [""];
        book.pubDate = sellingData.pubDate || "";
        book.isbn = sellingData.isbn;
        book.msrp = sellingData.msrp || 0;
        book.save((err: Error)=>{
          next(res)
        })
      }
      const cost = sellingData.cost;
      const comission = cost * 0.07;
      const finalCommission =
        cost + (comission % 5) == 0
          ? cost + comission
          : 5 - ((cost + comission) % 5) + comission;
      const listing = new BookListing({
        commission: finalCommission,
        cost: sellingData.cost,
        bookOwner: req.user,
        book: book,
        status: "registered",
      });
      const label = new Label({
        barcode: generateBarcode(listing._id),
        sold: false
      })
      label.save((err, label)=>{
        if(err){
          next(err)
        }
        listing.label = label
        listing.save((err: NativeError, BookListingDocument)=>{
          if (err){
            next(err)
          }
          req.flash("success", {msg: "Dodano książkę!"});
          return res.redirect("/");
        });
      })
    }
  );
}
export const getManageBook = (req: Request, res: Response) => {
  check("id", "Nie podano identyfikatora książki").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.findOne({_id: req.params.id}).populate("book").exec((err: NativeError, listing: BookListingDocument)=>{
    if(err){
      req.flash("errors", {msg: err});
      return res.redirect("/");
    }
    res.render("book/editBook", {item: listing})
  })
}
export const getPrintSetup = (req: Request, res: Response) => {
  BookListing.find({bookOwner: req.user}).populate("book").populate({path: 'label'}).exec((err: NativeError, listings: BookListingDocument[])=>{
    if(err){
      req.flash("errors", {msg: err});
      return res.redirect("/");
    }
    listings.sort(function(a, b) { return (a.label.print ? 1 : 0) - (b.label.print ? 1 : 0); });

    res.render("label/manage", {
      title: "Wydrukuj Etykietę",
      listings: listings,
      selectedLabel: req.query.selectedLabel
    });
  })
};

export const redirectPrintSuccess = (req: Request, res: Response) => {
  req.flash("success", {msg: "włóż zakładki do książek i oddaj książkę do punktu sprzedaży w elektryczniaku"})
  res.redirect('/')
}
export const getPrintLabel = (req: Request, res: Response) => {
  for (var id in Object.keys(req.query)){
    check(id).exists().isNumeric().isLength({min:13}).run(req)
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  
  BookListing.find({bookOwner: req.user}).where({_id: Object.keys(req.query)}).populate("label").populate("book").populate("bookOwner").exec((err: NativeError, listings)=>{
    res.render("label/bookIdentifier", {
      listings: listings
    })
  })
}

export const redirectPrint = (req: Request, res: Response)=>{
  check("id").exists().isNumeric().isLength({min:13}).run(req)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  res.redirect("/label?selectedLabel="+req.params.id)
}
export const getRegisterPrint = async (req: Request, res: Response)=>{
  
  for (var id in Object.keys(req.query)){
    check(id).exists().isNumeric().isLength({min:13}).run(req)
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");

  }
    BookListing.find({ bookOwner: req.user }).where({_id: Object.keys(req.query)}).populate("label").exec((err, listings)=>{
    if (err){
      req.flash("errors", errors.array());
      return res.redirect("/");
    }
    listings.forEach((listing)=>{
      
      listing.status = "printed_label"
      listing.label.print = true;
      listing.label.save((err: NativeError, label)=>{
        console.log(label)
        if (err) {
          req.flash("errors", errors.array());
          return res.redirect("/");
        }
      })
      listing.save((err: NativeError)=>{
        if (err) {
          req.flash("errors", errors.array());
          return res.redirect("/");
        }
      })
      res.status(200).end()
    })
    })
}
// export async function postSellBook(req: Request, res: Response): Promise<Response<never>> {
//   await check("isbn").isLength({ min: 13 }).isNumeric().run(req);
//   await check("name").exists().run(req);
//   await check("surname").exists().run(req);
//   await check("email").exists().run(req);
//   await check("phone").exists().run(req);
//   await check("isbn").exists().run(req);
//   await check("title").exists().run(req);
//   await check("cost").exists().run(req);
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   const sellingData = req.body;
//   Book.findOne(
//     { isbn: req.body.isbn },
//     async (err: NativeError, book: BookDocument) => {
//       if (!book) {
//         book = new Book({
//           title: sellingData.title,
//           publisher: sellingData.publisher || "",
//           authors: sellingData.authors.split(",") || [""],
//           pubDate: sellingData.pubDate || "",
//           isbn: sellingData.isbn,
//           image: sellingData.image || "",
//           msrp: sellingData.msrp || 0,
//         });
//         book.save();
//       }else if(book.$isEmpty("title")){
//         book.update({
//           title: sellingData.title,
//           publisher: sellingData.publisher || "",
//           authors: sellingData.authors.split(",") || [""],
//           pubDate: sellingData.pubDate || "",
//           isbn: sellingData.isbn,
//           image: sellingData.image || "",
//           msrp: sellingData.msrp || 0,
//         });
//       }
//       User.findOne({email: sellingData.email}, (err: NativeError, user: UserDocument)=>{
//         if (!user) {}
//       });
//       // Buyer.findOne(
//       //   { phone: sellingData.phone },
//       //   (err: NativeError, user: BuyerDocument) => {
//       //     if (!user) {
//       //       user = new Buyer({
//       //         name: sellingData.name,
//       //         surname: sellingData.surname,
//       //         phone: sellingData.phone,
//       //         email: sellingData.email,
//       //       });
//       //       user.save();
//       //     }
//       //     const bookListing = new BookListing({
//       //       book: book.id,
//       //       bookOwner: user.id,
//       //       commission: Number(sellingData.commission),
//       //       cost: Number(sellingData.cost),
//       //       putOnSaleBy: req.user
//       //     });
//       //     bookListing.save((err)=>{
//       //       if(err){
//       //           console.log(err);
//       //           req.flash("errors", {
//       //               msg: err
//       //           });
//       //           return res.redirect("/");
//       //       }else{ 
//       //           req.flash("success", {
//       //               msg: "Dodano zlecenie do bazy!",
//       //             });
//       //           return res.redirect("/");
//       //       }
//       //     });

//       //   }
//       // );
//     }
//   );
// }

export async function getFindListing(req: Request, res: Response): Promise<void> {
  await check("itemID").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      req.flash("errors", errors.array());
      return res.redirect("/");
  }
  const itemId = req.query.itemID;
  const bookListings = await BookListing.find({_id: itemId}, "-__v -createdAt -updatedAt")
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
  res.render("book/showBooks", { bookListings: bookListings, edit: true });
}
export async function getFindListingApp(req: Request, res: Response): Promise<void> {
  await check("itemID").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  const bookListings = await BookListing.find(
    { _id: req.query.itemID },
    "-__v -createdAt -updatedAt"
  )
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
    res.json(bookListings);
}
export async function getBookRegistry(req: Request, res: Response): Promise<void>{

  const bookListings = await BookListing.find({}, "-__v -createdAt -updatedAt")
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
  res.render("book/showBooks", {bookListings: bookListings});
}
// export async function postBook
export async function editBook(
  req: Request,
  res: Response
): Promise<void> {
  await check("itemID").isLength({ min: 12 }).isNumeric().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  const bookListings = await BookListing.findOne(
    { _id: req.params.itemID },
    "-__v -createdAt -updatedAt"
  )
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt")
    .populate("putOnSaleBy")
    .populate("soldBy");
    res.render("book/editBook", { item: bookListings, edit: true });
}

export async function sellBook(
  req: Request,
  res: Response,
): Promise<void>  {
    await check("itemID").isLength({ min: 12 }).isNumeric().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/");
    }
    const bookListings = await BookListing.findOne(
      { _id: req.params.itemID },
      "-__v -createdAt -updatedAt"
    )
      .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
      .populate("book", "-_id -__v -createdAt -updatedAt");
    bookListings.status = "sold";
    bookListings.soldBy = (req.user as UserDocument);
    bookListings.save((err)=>{
        if(err){
            console.log(err);
            req.flash("errors", {
                msg: err
            });
            return res.redirect("/book/"+req.params.itemID);
        }else{ 
            req.flash("success", {msg:"Udało się! Sprzedanio książkę!"});
            return res.redirect("/book/"+req.params.itemID);
        }
    });
    

}
export async function sellBookApp(
  req: Request,
  res: Response,
): Promise<Response<never>> {
  await check("itemID").isLength({ min: 12 }).isNumeric().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  const bookListings = await BookListing.findOne(
    { _id: req.params.itemID },
    "-__v -createdAt -updatedAt"
  )
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
  bookListings.status = "sold";
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
