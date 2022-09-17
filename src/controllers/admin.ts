import { NextFunction, Request, Response } from "express";
import { User, UserDocument } from "../models/User";
import { BookListing, BookListingDocument } from "../models/BookListing";
import { body, check, validationResult } from "express-validator";
import moment from "moment";
import durationFormat from "moment-duration-format";
import { Book } from "../models/Book";
import { median } from "../util/math";
import { Buyer } from "../models/Buyer";
import { UserPerformance } from "../models/Performance";
import mongoose, { CallbackError } from "mongoose";
import crypto from "crypto";
import { WriteError } from "mongodb";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
durationFormat(moment);
export async function main(req: Request, res: Response): Promise<void> {
  const data = await UserPerformance.aggregate([
    {
      $group: {
        _id: "$user",
        sum: {
          $sum: "$time",
        },
        avg: {
          $avg: "$time",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $addFields: {
        role: {
          $first: "$user",
        },
      },
    },
    {
      $addFields: {
        role: "$role.role",
      },
    },
    {
      $project: {
        user: 0,
      },
    },
    {
      $group: {
        _id: "$role",
        sum: {
          $sum: "$sum",
        },
        avg: {
          $avg: "$avg",
        },
      },
    },
  ]);
  data.forEach((role) => {
    role.formattedAvg = moment
      .duration(role.avg, "milliseconds")
      .format("w[w] d[d] h[h] m[m] s[s]");
    role.formattedSum = moment
      .duration(role.sum, "milliseconds")
      .format("w[w] d[d] h[h] m[m] s[s]");
  });
  res.render("admin/page/dashboard", { title: "Dashboard", data: data });
}

export async function users(req: Request, res: Response): Promise<void> {
  const stats = await User.aggregate([
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "bookOwner",
        as: "listings",
      },
    },
    {
      $unwind: {
        path: "$listings",
      },
    },
    {
      $match: {
        $nor: [
          {
            "listings.status": "canceled",
          },
          {
            "listings.status": "deleted",
          },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        bookDebt: {
          $sum: "$listings.cost",
        },
        earnings: {
          $sum: "$listings.commission",
        },
        bookCount: {
          $sum: 1,
        },
      },
    },
    {
      $group: {
        _id: null,
        bookDebt: {
          $sum: "$bookDebt",
        },
        earnings: {
          $sum: "$earnings",
        },
        bookAvg: {
          $avg: "$bookCount",
        },
      },
    },
  ]);
  const userData = await User.aggregate([
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "bookOwner",
        as: "listings",
      },
    },
    {
      $unwind: {
        path: "$listings",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $nor: [
          {
            "listings.status": "registered",
          },
          {
            "listings.status": "printed_label",
          },
          {
            "listings.status": "deleted",
          },
          {
            "listings.status": "canceled",
          },
          {
            "listings.status": "given_money",
          },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        listings: {
          $addToSet: "$listings",
        },
        email: {
          $first: "$email",
        },
        profile: {
          $first: "$profile",
        },
        mustGive: {
          $sum: "$listings.cost",
        },
        earnings: {
          $sum: "$listings.commission",
        },
      },
    },
    {
      $addFields: {
        books: {
          $size: "$listings",
        },
        totalCost: {
          $add: ["$mustGive", "$earnings"],
        },
      },
    },
    {
      $project: {
        listings: 0,
      },
    },
    {
      $sort: {
        books: -1,
      },
    },
  ]);
  const staff = await User.aggregate([
    {
      $match: {
        role: {
          $in: ["admin", "seller"],
        },
      },
    },
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "verifiedBy",
        as: "verified",
      },
    },
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "soldBy",
        as: "sold",
      },
    },
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "deletedBy",
        as: "deleted",
      },
    },
    {
      $addFields: {
        verifiedBooks: {
          $size: "$verified",
        },
        soldBooks: {
          $size: "$sold",
        },
        deletedBooks: {
          $size: "$deleted",
        },
      },
    },
    {
      $project: {
        sold: 0,
        verified: 0,
        deleted: 0,
      },
    },
  ]);
  // console.log(stats);
  res.render("admin/page/users", {
    title: "Users",
    stats: stats[0],
    userData: userData,
    staff: staff,
  });
}

export async function buyers(req: Request, res: Response): Promise<void> {
  const data = await Buyer.aggregate([
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "boughtBy",
        as: "books",
      },
    },
    {
      $addFields: {
        bookCount: {
          $size: "$books",
        },
      },
    },
    {
      $unwind: {
        path: "$books",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        name: {
          $first: "$name",
        },
        surname: {
          $first: "$surname",
        },
        email: {
          $first: "$email",
        },
        phone: {
          $first: "$phone",
        },
        books: {
          $first: "$bookCount",
        },
        moneySpent: {
          $sum: {
            $add: ["$books.cost", "$books.commission"],
          },
        },
        profit: {
          $sum: "$books.commission",
        },
      },
    },
    {
      $sort: {
        books: -1,
      },
    },
  ]);
  res.render("admin/page/buyers", { title: "Buyers", buyers: data });
}

export async function books(req: Request, res: Response) {
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
      $addFields: {
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
      $unwind: "$listings",
    },
    {
      $match: {
        $nor: [
          {
            "listings.status": "canceled",
          },
          {
            "listings.status": "deleted",
          },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        avgCost: {
          $avg: "$listings.cost",
        },
        sold: {
          $first: "$sold",
        },
        available: {
          $first: "$available",
        },
        title: {
          $first: "$title",
        },
        publisher: {
          $first: "$publisher",
        },
        costTable: {
          $addToSet: "$listings.cost",
        },
      },
    },
    {
      $sort: {
        sold: -1,
      },
    },
  ]);
  result.forEach((value) => {
    value.median = median(value.costTable);
  });
  res.render("admin/page/books", { title: "Books", data: result });
}

interface Dataset {
  label: string;
  data: { x: string; y: number }[];
  fill: boolean;
  borderColor: string;
}
export async function apiBooks(req: Request, res: Response) {
  await check("from", "no from date provided").exists().run(req);
  await check("to", "no to date provided").exists().run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).end();
  }

  const { from, to, exact } = req.query as unknown as {
    from: string;
    to: string;
    exact: boolean;
  };
  BookListing.aggregate([
    {
      $addFields: {
        fromDate: new Date(from),
        toDate: new Date(to),
      },
    },
    {
      $match: {
        $expr: {
          $or: [
            {
              $and: [
                {
                  $gt: ["$createdAt", "$fromDate"],
                },
                {
                  $lt: ["$createdAt", "$toDate"],
                },
              ],
            },
            {
              $and: [
                {
                  $gt: ["$whenPrinted", "$fromDate"],
                },
                {
                  $lt: ["$whenPrinted", "$toDate"],
                },
              ],
            },
            {
              $and: [
                {
                  $gt: ["$whenVerified", "$fromDate"],
                },
                {
                  $lt: ["$whenVerified", "$toDate"],
                },
              ],
            },
            {
              $and: [
                {
                  $gt: ["$whenSold", "$fromDate"],
                },
                {
                  $lt: ["$whenSold", "$toDate"],
                },
              ],
            },
            {
              $and: [
                {
                  $gt: ["$whenGivenMoney", "$fromDate"],
                },
                {
                  $lt: ["$whenGivenMoney", "$toDate"],
                },
              ],
            },
            {
              $and: [
                {
                  $gt: ["$whenCanceled", "$fromDate"],
                },
                {
                  $lt: ["$whenCanceled", "$toDate"],
                },
              ],
            },
            {
              $and: [
                {
                  $gt: ["$whenDeleted", "$fromDate"],
                },
                {
                  $lt: ["$whenDeleted", "$toDate"],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        dates: [
          {
            type: "created",
            date: "$createdAt",
          },
          {
            type: "printed_label",
            date: "$whenPrinted",
          },
          {
            type: "accepted",
            date: "$whenVerified",
          },
          {
            type: "sold",
            date: "$whenSold",
          },
          {
            type: "given_money",
            date: "$whenGivenMoney",
          },
          {
            type: "canceled",
            date: "$whenCanceled",
          },
          {
            type: "deleted",
            date: "$whenDeleted",
          },
        ],
      },
    },
    {
      $unwind: "$dates",
    },
    {
      $group: {
        _id: exact
          ? {
              year: {
                $year: "$dates.date",
              },
              month: {
                $month: "$dates.date",
              },
              day: {
                $dayOfMonth: "$dates.date",
              },
              hour: {
                $hour: "$dates.date",
              },
              // minute: {
              //   $minute: "$dates.date",
              // },
            }
          : {
              year: {
                $year: "$dates.date",
              },
              month: {
                $month: "$dates.date",
              },
              day: {
                $dayOfMonth: "$dates.date",
              },
            },
        created: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$dates.type", "created"],
              },
              then: 1,
              else: 0,
            },
          },
        },
        printed_label: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$dates.type", "printed_label"],
              },
              then: 1,
              else: 0,
            },
          },
        },
        accepted: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$dates.type", "accepted"],
              },
              then: 1,
              else: 0,
            },
          },
        },
        sold: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$dates.type", "sold"],
              },
              then: 1,
              else: 0,
            },
          },
        },
        given_money: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$dates.type", "given_money"],
              },
              then: 1,
              else: 0,
            },
          },
        },
        canceled: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$dates.type", "canceled"],
              },
              then: 1,
              else: 0,
            },
          },
        },
        deleted: {
          $sum: {
            $cond: {
              if: {
                $eq: ["$dates.type", "deleted"],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $addFields: {
        date: {
          $dateFromParts: exact
            ? {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
                hour: "$_id.hour",
                // minute: "$_id.minute",
              }
            : {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
        },
      },
    },
    {
      $match: {
        $expr: {
          $ne: ["$date", null],
        },
      },
    },
  ]).exec(
    (
      err: Error,
      userStatistics: {
        date: Date;
        _id: {
          year: number;
          month: number;
          day: number;
          hour?: number;
          minute?: number;
        };
        created: number;
        printed_label: number;
        accepted: number;
        sold: number;
        given_money: number;
        canceled: number;
        deleted: number;
      }[]
    ) => {
      if (err) {
        return res.status(500).end();
      }
      // console.log(userStatistics);
      const dataset: Dataset[] = [];
      dataset.push({
        label: "Books Created",
        data: userStatistics.map((val) => {
          if (val.date) {
            return {
              x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
              y: val.created,
            };
          }
        }),
        borderColor: "green",
        fill: true,
      });
      dataset.push({
        label: "Labels Printed",
        data: userStatistics.map((val) => {
          return val.date
            ? {
                x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
                y: val.printed_label,
              }
            : undefined;
        }),
        borderColor: "blue",
        fill: true,
      });
      dataset.push({
        label: "Books Accepted",
        data: userStatistics.map((val) => {
          return val.date
            ? {
                x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
                y: val.accepted,
              }
            : undefined;
        }),
        borderColor: "yellow",
        fill: true,
      });
      dataset.push({
        label: "Books Sold",
        data: userStatistics.map((val) => {
          return val.date
            ? {
                x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
                y: val.sold,
              }
            : undefined;
        }),
        borderColor: "white",
        fill: true,
      });
      dataset.push({
        label: "Money Given",
        data: userStatistics.map((val) => {
          return val.date
            ? {
                x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
                y: val.given_money,
              }
            : undefined;
        }),
        borderColor: "orange",
        fill: true,
      });
      dataset.push({
        label: "Books Canceled",
        data: userStatistics.map((val) => {
          return val.date
            ? {
                x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
                y: val.canceled,
              }
            : undefined;
        }),
        borderColor: "red",
        fill: true,
      });
      dataset.push({
        label: "Books Deleted",
        data: userStatistics.map((val) => {
          return val.date
            ? {
                x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
                y: val.deleted,
              }
            : undefined;
        }),
        borderColor: "purple",
        fill: true,
      });
      dataset.forEach((data) => {
        // console.log(data.data, "not sorted");
        data.data.sort(
          (a, b) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            new Date(moment(a.x, "DD/MM/YYYY/HH:mm:ss")) -
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            new Date(moment(b.x, "DD/MM/YYYY/HH:mm:ss"))
        );
        // console.log(data.data, "sorted");
      });
      return res.json(dataset).end();
    }
  );
}
export async function apiUsers(req: Request, res: Response) {
  await check("from", "no from date provided").exists().run(req);
  await check("to", "no to date provided").exists().run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).end();
  }
  const { from, to, exact } = req.query as unknown as {
    from: string;
    to: string;
    exact: boolean;
  };
  User.aggregate([
    {
      $addFields: {
        fromDate: new Date(from),
        toDate: new Date(to),
      },
    },
    {
      $match: {
        $expr: {
          $or: [
            {
              $and: [
                { $gt: ["$createdAt", "$fromDate"] },
                { $lt: ["$createdAt", "$toDate"] },
              ],
            },
          ],
        },
      },
    },
    exact
      ? {
          $group: {
            _id: {
              hour: {
                $hour: "$createdAt",
              },
              minute: {
                $minute: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
              day: {
                $dayOfMonth: "$createdAt",
              },
              year: {
                $year: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        }
      : {
          $group: {
            _id: {
              month: {
                $month: "$createdAt",
              },
              day: {
                $dayOfMonth: "$createdAt",
              },
              year: {
                $year: "$createdAt",
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
    {
      $addFields: {
        date: {
          $dateFromParts: exact
            ? {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
                hour: "$_id.hour",
                minute: "$_id.minute",
              }
            : {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
        },
      },
    },
    {
      $match: {
        $expr: {
          $ne: ["$date", null],
        },
      },
    },
    {
      $project: {
        _id: false,
      },
    },
  ]).exec((err: Error, userStatistics: { date: Date; count: number }[]) => {
    if (err) {
      return res.status(500).end();
    }
    // console.log(userStatistics);
    userStatistics.sort(function (a, b) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      return new Date(b.date) - new Date(a.date);
    });
    const dataset: Dataset[] = [];
    dataset.push({
      label: "Registered Users",
      data: userStatistics.map((val) => {
        return {
          x: moment(new Date(val.date)).format("DD/MM/YYYY/HH:mm:ss"),
          y: val.count,
        };
      }),
      borderColor: "green",
      fill: false,
    });
    return res.json(dataset).end();
  });
}

export const getEditUser = async (req: Request, res: Response) => {
  await check("userID").exists().run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("back");
  }
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.userID),
      },
    },
    {
      $lookup: {
        from: "booklistings",
        localField: "_id",
        foreignField: "bookOwner",
        as: "books",
      },
    },
    {
      $unwind: {
        path: "$books",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "books.book",
        foreignField: "_id",
        as: "books.book",
      },
    },
    // {
    //   $match: {
    //     "books.status": {
    //       $in: ["sold", "accepted"],
    //     },
    //   },
    // },
    {
      $group: {
        _id: "$_id",
        availableBooks: {
          $addToSet: "$books",
        },
        email: {
          $first: "$email",
        },
        role: {
          $first: "$role",
        },
        profile: {
          $first: "$profile",
        },
        debt: {
          $sum: {
            $cond: [
              {
                $eq: ["$books.status", "sold"],
              },
              "$books.cost",
              0,
            ],
          },
        },
      },
    },
  ]);
  // console.log(JSON.stringify(user));
  user[0].gravatar = function (size: number = 200) {
    if (!this.email) {
      return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
  };
  res.render("admin/page/account", {
    title: "Edit",
    euser: user[0],
    accountEdit: true,
  });
};

// export const postRemoveUser = async (req: Request, res: Response, next: NextFunction) => {
//   await check("userID").exists().run(req);
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     req.flash("errors", errors.array());
//     return res.redirect("back");
//   }
//   User.remove({ _id: req.params.userID }, (err) => {
//     if (err) {
//       return next(err);
//     }
//     req.flash("info", { msg: "this account has been deleted." });
//     res.redirect("/");
//   });
// };

export const postEditUser = async (req: Request, res: Response, next: NextFunction) => {
  await check("userID").exists().run(req);

  await check("email", "Please enter a valid email address.")
    .isEmail()
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/admin");
  }

  User.findById(req.params.userID, (err: NativeError, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.surname = req.body.surname || "";
    user.profile.gender = req.body.gender || "";
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";
    user.save((err: WriteError & CallbackError) => {
      if (err) {
        if (err.code === 11000) {
          req.flash("errors", {
            msg: "The email address you have entered is already associated with an account.",
          });
          return res.redirect("/admin");
        }
        return next(err);
      }
      req.flash("success", { msg: "Profile information has been updated." });
      res.redirect("/admin");
    });
  });
};

export const postGiveMoneyUser = async (req: Request, res: Response) => {
    await check("userID").exists().run(req);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("errors", errors.array());
      return res.redirect("back");
    }
    BookListing.find({bookOwner: req.params.userID, status: {$in: ["sold", "accepted"]}}).exec((err: Error, listings: BookListingDocument[])=>{
      if (err){
        req.flash("errors", {msg: err});
        return res.redirect("back");
      }
      listings.forEach((listing)=>{
        listing.status = "given_money";
        listing.whenGivenMoney = new Date();
        listing.givenMoneyBy = req.user as UserDocument;
        listing.save((err)=>{
          req.flash("errors", { msg: err });
        });
      });
      req.flash("success", {msg: "everything is okay!"});
      return res.redirect("back");
    });
};
