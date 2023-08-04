import { Request, Response } from "express";
import { Book } from "../models/Book";
import { BookListing } from "../models/BookListing";
import { UserDocument } from "../models/User";

/**
 * Home page.
 * @route GET /
 */
// export const index = (req: Request, res: Response) => {
//     res.render("home", {
//         title: "Home"
//     });
// };

async function fetchTopBooks(): Promise<
  { _id: number; title?: string; publisher?: string; count: number }[]
> {
  const result = await Book.aggregate([
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "book",
        as: "listings",
      },
    },
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "book",
        as: "listings",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        publisher: 1,
        available: {
          $size: {
            $filter: {
              input: "$listings",
              as: "available",
              cond: {
                $eq: ["$$available.status", "accepted"],
              },
            },
          },
        },
        sold: {
          $size: {
            $filter: {
              input: "$listings",
              as: "available",
              cond: {
                $eq: ["$$available.status", "sold"],
              },
            },
          },
        },
      },
    },
    {
      $sort: {
        available: -1,
      },
    },
  ]);

  return result;
  // documents.forEach(item => {(item as (BookDocument & { count: number })).count = 1;});
  // return documents as (BookDocument & { count: number })[];
}
export const index = async (req: Request, res: Response): Promise<void> => {
  if ((req.user as UserDocument).role != "student") {
    res.render("homeStaff", {
      title: "Home",
      availableBooks: await fetchTopBooks(),
    });
  } else {
    const bookListings = await BookListing.find({ bookOwner: req.user })
      .populate("book", "-image")
      .catch((err: Error) => {
        req.flash("errors", { msg: JSON.stringify(err) });
        return res.redirect("/");
      });
    res.render("home", {
      title: "Home",
      bookListings: bookListings
        ? bookListings.length > 0
          ? bookListings
          : undefined
        : undefined,
    });
  }
};
