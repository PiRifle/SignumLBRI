import { fetchBook } from "../util/findBook";
import { Request, Response } from "express";
import { Book, BookDocument } from "../models/Book";
import { Error, FilterQuery } from "mongoose";
import { check, validationResult } from "express-validator";
import { Buyer } from "../models/Buyer";
import { BuyerDocument } from "../models/Buyer";
import { BookListing, BookListingDocument, Label } from "../models/BookListing";
import { UserDocument } from "../models/User";
import { generateBarcode } from "../util/barcode";
import { fetchTopBooks } from "../util/book";

export async function getFillBookData(
  req: Request,
  res: Response
): Promise<Response<never>> {
  await check("isbn", "Podano nieprawidłowy kod ISBN")
    .isLength({ min: 13 })
    .isNumeric()
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const isbn = Number(req.query.isbn);
  Book.findOne({ isbn: isbn }, async (err: Error, book: BookDocument) => {
    if (err) throw err;
    if (book) {
      const bookData = book;
      res.json(bookData);
    } else {
      const bookData = await fetchBook(isbn);
      let book: BookDocument;
      if (bookData) {
        book = new Book({
          title: bookData.title,
          publisher: bookData.publisher,
          authors: bookData.authors,
          pubDate: bookData.pubDate,
          isbn: bookData.isbn,
          image: bookData.image,
          msrp: bookData.msrp,
        });
      } else {
        book = new Book({
          isbn: isbn,
        });
      }
      book.save((err) => {
        console.log(err);
      });
      if (!bookData) {
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

export async function postSellBookApp(
  req: Request,
  res: Response
): Promise<Response<never>> {
  await check("isbn", "Podano nieprawidłowy kod ISBN")
    .isLength({ min: 13 })
    .isNumeric()
    .run(req);
  await check("name", "Nie podano imienia").exists().notEmpty().run(req);
  await check("surname", "Nie podano nazwiska").exists().notEmpty().run(req);
  await check("email", "Email is not valid").isEmail().run(req);
  await check("phone", "Nie podano numeru telefonu")
    .isMobilePhone("pl-PL")
    .run(req);
  await check("title", "Nie podano tytułu książki")
    .exists()
    .notEmpty()
    .run(req);
  await check("cost", "Nie podano ceny")
    .exists()
    .isNumeric()
    .isCurrency()
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const sellingData = req.body;
  Book.findOne(
    { isbn: req.body.isbn },
    async (err: Error, book: BookDocument) => {
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
        (err: Error, user: BuyerDocument) => {
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
              return res.json({ msg: "added_item_to_db" });
            }
          });
        }
      );
    }
  );
}
export async function postSellBook(
  req: Request,
  res: Response
): Promise<unknown> {
  await check("isbn", "kod ISBN nie jest ważny")
    .isLength({ min: 13, max: 13 })
    .isEAN()
    .run(req);
  await check("title", "Nie podano tytułu książki").exists().run(req);
  await check("publisher", "Nie podano wydawcy książki").exists().run(req);
  await check("pubDate", "podano zły rok publikacji").isNumeric().run(req);
  await check("cost", "Nie podano ceny lub złą wartość")
    .exists()
    .isNumeric()
    .isFloat()
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  const sellingData = req.body;
  // console.log(sellingData);

  Book.findOne({ isbn: req.body.isbn }, (err: Error, book: BookDocument) => {
    new Promise((resolve, reject) => {
      if (err) {
        return reject(err);
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
        book.save((err: Error) => {
          if (err) {
            return reject(err);
          }
        });
      } else if (!book.title) {
        book.title = sellingData.title;
        book.publisher = sellingData.publisher || "";
        book.authors = sellingData.authors.split(",") || [""];
        book.pubDate = sellingData.pubDate || "";
        book.isbn = sellingData.isbn;
        book.msrp = sellingData.msrp || 0;
        book.save((err: Error) => {
          if (err) {
            return reject(err);
          }
        });
      }
      const cost = Number(sellingData.cost);
      const comission = cost * 0.07;
      const finalCommission =
        cost + (comission % 2) == 0
          ? cost + comission
          : 2 - ((cost + comission) % 2) + comission;
      const listing = new BookListing({
        commission: finalCommission,
        cost: sellingData.cost,
        bookOwner: req.user,
        book: book,
        status: "registered",
      });
      const label = new Label({
        barcode: generateBarcode(listing._id),
        sold: false,
      });
      label.save((err, label) => {
        if (err) {
          return reject(err);
        }
        listing.label = label;
        listing.save((err: Error): void => {
          if (err) {
            return reject(err);
          }
          resolve(listing);
        });
      });
    })
      .then((listing: BookListingDocument) => {
        req.flash("success", { msg: "Gratulacje dodano książkę" });
        res.redirect("/label?selectedLabel=" + listing._id);
      })
      .catch((err) => {
        console.log(err);
        req.flash("errors", { msg: JSON.stringify(err) });
        res.redirect("/");
      });
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getManageBook = (
  req: Request & { user: UserDocument },
  res: Response
) => {
  check("id", "Nie podano identyfikatora książki").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.findOne({ _id: req.params.id })
    .populate("book")
    .populate("bookOwner")
    .exec((err: Error, listing: BookListingDocument) => {
      if (err) {
        req.flash("errors", { msg: JSON.stringify(err) });
        return res.redirect("/");
      }
      if (!listing) {
        req.flash("errors", { msg: "nie znaleziono książki" });
        return res.redirect("/");
      }
      // if(!listing.bookOwner){
      //   console.log("no bookowner");
      // }
      if (res.locals.device.mobile()) {
        return res.render("book/editBookMobile", {
          item: listing,
          edit: req.user.isSeller(),
          acceptString: `${"/book/" + listing._id + "/accept"}`,
          sellString: `${"/book/" + listing._id + "/sell"}`,
        });
      } else {
        return res.render("book/editBook", {
          item: listing,
          edit: req.user.isSeller(),
          acceptString: `${"/book/" + listing._id + "/accept"}`,
          sellString: `${"/book/" + listing._id + "/sell"}`,
        });
      }
    });
};
export const getPrintSetup = (req: Request, res: Response): void => {
  BookListing.find(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    req.user.isSeller()
      ? {}
      : { bookOwner: req.user }
  )
    .populate("book")
    .populate({ path: "label" })
    .exec((err: Error, listings: BookListingDocument[]) => {
      if (err) {
        req.flash("errors", { msg: JSON.stringify(err) });
        return res.redirect("/");
      }
      listings.sort(function (a, b) {
        return (a.label.print ? 1 : 0) - (b.label.print ? 1 : 0);
      });

      res.render("label/manage", {
        title: "Wydrukuj Etykietę",
        listings: listings,
        selectedLabel: req.query.selectedLabel,
      });
    });
};

export const redirectPrintSuccess = (req: Request, res: Response): void => {
  req.flash("success", {
    msg: "włóż etykiety do książek i oddaj książkę do punktu sprzedaży w elektryczniaku",
  });
  res.redirect("/");
};
export const getPrintLabel = (req: Request, res: Response): void => {
  for (const id in Object.keys(req.query)) {
    check(id).exists().isNumeric().isLength({ min: 13 }).run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.find(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    req.user.isSeller()
      ? {}
      : { bookOwner: req.user }
  )
    .where({ _id: Object.keys(req.query) })
    .populate("label")
    .populate("book")
    .populate("bookOwner")
    .exec((err: Error, listings) => {
      // if(!listings.bookOwner){
      //   console.log("no bookowner");
      // }
      res.render("label/bookIdentifier", {
        listings: listings,
      });
    });
};

export const redirectPrint = (req: Request, res: Response): void => {
  check("id", "Nie podano identyfikatora książki")
    .exists()
    .isNumeric()
    .isLength({ min: 13 })
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  res.redirect("/label?selectedLabel=" + req.params.id);
};
export const getRegisterPrint = async (
  req: Request,
  res: Response
): Promise<void> => {
  for (const id in Object.keys(req.query)) {
    check(id).exists().isNumeric().isLength({ min: 13 }).run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.find({ bookOwner: req.user })
    .where({ _id: Object.keys(req.query) })
    .populate("label")
    .exec((err, listings) => {
      if (err) {
        req.flash("errors", errors.array());
        return res.redirect("/");
      }
      listings.forEach((listing, i) => {
        if (listing.status != "registered") {
        } else {
          listing.status = "printed_label";
          listing.whenPrinted = new Date();
          listing.label.print = true;
          listing.label.save((err: Error) => {
            if (err) {
              req.flash("errors", errors.array());
              return res.status(500);
            }
          });
          listing.save((err: Error) => {
            if (err) {
              req.flash("errors", errors.array());
              return res.status(500);
            }
            if (i + 1 == listings.length) return res.status(200);
          });
        }
      });
      res.end();
    });
};

export async function getFindListing(
  req: Request,
  res: Response
): Promise<void> {
  await check("itemID", "Nie podano identyfikatora książki")
    .exists()
    .isNumeric()
    .isLength({ min: 13, max: 13 })
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  const itemId = req.query.itemID;
  res.redirect(`/book/${itemId}/manage`);

  // const bookListings = await BookListing.find({_id: itemId}, "-__v -createdAt -updatedAt");
  //   // .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
  //   // .populate("book", "-_id -__v -createdAt -updatedAt");
  //   if(bookListings.length != 0){
  //     if(res.locals.device.mobile()){
  //       res.redirect(`/book/${bookListings[0]._id}/manage`);
  //     }else{
  //               res.redirect(`/book/${bookListings[0]._id}/manage`);

  //     }
  //   }else{
  //     req.flash("info", {msg: "Book not found"});
  //     res.redirect("/");
  //   }
}
export async function getFindListingApp(
  req: Request,
  res: Response
): Promise<void> {
  await check("itemID", "Nie podano identyfikatora książki").exists().run(req);
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
export async function getBookRegistry(
  req: Request,
  res: Response
): Promise<void> {
  await check("page", "Nie podano strony")
    .exists()
    .isNumeric()
    .isInt()
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  const page = req.query.page;
  const options = {
    page: Number(page),
    populate: "book bookOwner",
    limit: 10,
  };
  const query: FilterQuery<BookListingDocument> = {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  if (req.user.isAdmin()) {
    query.status = { $nin: ["canceled", "deleted"] };
  }
  const bookListings = await BookListing.paginate(query, options);
  // console.log(bookListings);

  res.render("book/showBooks", {
    bookListings: bookListings.docs,
    paging: bookListings,
  });
}
// export async function postBook
export async function editBook(req: Request, res: Response): Promise<void> {
  await check("itemID", "Nie podano identyfikatora książki")
    .isLength({ min: 12 })
    .isNumeric()
    .run(req);
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

export async function sellBook(req: Request, res: Response): Promise<void> {
  await check("id", "Nie podano identyfikatora książki")
    .isLength({ min: 13, max: 13 })
    .isNumeric()
    .run(req);
  await check("name", "Nie podano imienia").exists().run(req);
  await check("surname", "Nie podano nazwiska").exists().run(req);
  await check("email", "Email jest nieprawidłowy").isEmail().run(req);
  await check("phone", "Numer Telefony jest nieprawidłowy")
    .isMobilePhone("pl-PL")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  const bookListings = await BookListing.findOne(
    { _id: req.params.id },
    "-__v -createdAt -updatedAt"
  )
    .populate("bookOwner", "-_id -__v -createdAt -updatedAt")
    .populate("book", "-_id -__v -createdAt -updatedAt");
  bookListings.status = "sold";
  bookListings.soldBy = req.user as UserDocument;
  bookListings.whenSold = new Date();
  bookListings.boughtBy = await Buyer.findOneAndUpdate(
    {
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      email: req.body.email,
    },
    {},
    { new: true, upsert: true }
  );
  bookListings.save((err) => {
    if (err) {
      console.log(err);
      req.flash("errors", { msg: JSON.stringify(err) });
      return res.redirect("/book/" + req.params.id + "/manage");
    } else {
      req.flash("success", { msg: "Udało się! Sprzedanio książkę!" });
      return res.redirect("/book/" + req.params.id + "/manage");
    }
  });
}
export async function sellBookApp(
  req: Request,
  res: Response
): Promise<Response<never>> {
  await check("itemID", "Nie podano identyfikatora książki")
    .isLength({ min: 12 })
    .isNumeric()
    .run(req);
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

export const acceptBook = (req: Request, res: Response): void => {
  check("id", "Nie podano identyfikatora książki").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.updateOne(
    { _id: req.params.id },
    { status: "accepted", verifiedBy: req.user, whenVerified: new Date() }
  ).exec((err: Error) => {
    if (err) {
      req.flash("errors", { msg: JSON.stringify(err) });
      return res.redirect("/");
    }
    req.flash("success", { msg: "przyjęto książkę!" });
    return res.redirect("manage");
  });
};

export const giveMoney = (req: Request, res: Response): void => {
  check("id", "Nie podano identyfikatora książki").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.updateOne(
    { _id: req.params.id },
    {
      status: "given_money",
      givenMoneyBy: req.user,
      whenGivenMoney: new Date(),
    }
  ).exec((err: Error) => {
    if (err) {
      req.flash("errors", { msg: JSON.stringify(err) });
      return res.redirect("/");
    }
    req.flash("success", { msg: "Oddano pieniądze!" });
    return res.redirect("manage");
  });
};
export const cancelBook = (req: Request, res: Response): void => {
  check("id", "Nie podano identyfikatora książki").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.findOne({ _id: req.params.id }).exec(
    (err: Error, listing: BookListingDocument) => {
      if (err) {
        req.flash("errors", { msg: JSON.stringify(err) });
        return res.redirect("/");
      }
      if (listing.status == "printed_label" || listing.status == "registered") {
        listing.whenCanceled = new Date();
        listing.status = "canceled";
        listing.save();
        req.flash("success", { msg: "Anulowano książkę" });
        return res.redirect("manage");
      } else {
        req.flash("errors", { msg: "Nie można anulować już ksiażki" });
        return res.redirect("manage");
      }
    }
  );
};

export const getLibrary = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (new Date(Date.now()) <= new Date("2022-09-15")) {
    return res.render("library/books", {
      title: "Biblioteka",
      data: await fetchTopBooks(),
      // disableScripts: true,
      // disableLogin: env.PREMIERE,
    });
  }
  return res.render("library/books", {
    title: "Biblioteka",
    data: await fetchTopBooks(),
    disableScripts: true,
  });
};

export const deleteBook = (req: Request, res: Response): void => {
  check("id", "Nie podano identyfikatora książki").exists().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }
  BookListing.updateOne(
    { _id: req.params.id },
    {
      status: "deleted",
      deletedBy: req.user,
      whenDeleted: new Date(),
    }
  ).exec((err: Error) => {
    if (err) {
      req.flash("errors", { msg: JSON.stringify(err) });
      return res.redirect("/");
    }
    req.flash("success", { msg: "Usunięto ksiażkę" });
    return res.redirect("manage");
  });
};
export function getBulkSell(req: Request, res: Response) {
  res.render("book/bulk", { disableSearch: true });
}

export async function postBulkSell(req: Request, res: Response) {
await check("name", "Nie podano imienia").exists().run(req);
await check("surname", "Nie podano nazwiska").exists().run(req);
await check("email", "Email jest nieprawidłowy").isEmail().run(req);
await check("phone", "Numer Telefony jest nieprawidłowy")
  .isMobilePhone("pl-PL")
  .run(req);
await check("bookIDS", "Nie podano identyfikatora książki").exists().isJSON().run(req);
const bookIDS = JSON.parse(req.body.bookIDS);


const errors = validationResult(req);
if (!errors.isEmpty()) {
  req.flash("errors", errors.array());
  return res.redirect("/");
}
const buyer = await Buyer.findOneAndUpdate(
  {
    name: req.body.name,
    surname: req.body.surname,
    phone: req.body.phone,
    email: req.body.email,
  },
  {},
  { new: true, upsert: true }
);
const findA = await Promise.all(bookIDS.map(async (book: string)=>{
  const find = await BookListing.findOneAndUpdate({_id: book, status:"accepted"}, {status: "sold", boughtBy: buyer, soldBy: req.user as UserDocument, whenSold: new Date()}).catch(err=>req.flash("errors", {msg: err}));
  console.log(find);
  if(find == null){
    req.flash("errors", {msg: `książka ${book} nie jest wystawiona do sprzedaży lub nie istnieje`});
  }
  return find;
}));
if (!findA.includes(null)){
  req.flash("success", {msg: "Sprzedano Ksiażki!"});
}
res.redirect("/bulk");
}
export async function listingJSON(req: Request, res: Response) {
  await check("itemID", "Nie podano identyfikatora książki")
    .exists()
    .isNumeric()
    .isLength({ min: 13, max: 13 })
    .run(req);
    const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).end();
  }
  const listing = await BookListing.findOne({_id: req.query.itemID}, "book cost commission id status").populate("book", "title publisher");
  return res.json(listing);
}

