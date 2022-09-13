import { Request, Response } from "express";
import { User } from "../models/User";
import { BookListing } from "../models/BookListing";
import { check, validationResult } from "express-validator";
import moment from "moment";
import { Book } from "../models/Book";
import { median } from "../util/math";

export function main(req: Request, res: Response): void {
  res.render("admin/page/dashboard", { title: "Dashboard" });
}

export function users(req: Request, res: Response): void {
  res.render("admin/page/users", { title: "Users" });
}

export function buyers(req: Request, res: Response): void {
  res.render("admin/page/dashboard", { title: "Buyers" });
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
  result.forEach((value)=>{
    value.median = median(value.costTable);
  });
  res.render("admin/page/books", { title: "Books", data: result});
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
              minute: {
                $minute: "$dates.date",
              },
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
          $dateFromParts: {
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
      console.log(userStatistics);

      const dataset: Dataset[] = [];
      dataset.push({
        label: "Books Created",
        data: userStatistics.map((val) => {
          if (val.date) {
            return {
              x: moment(new Date(val.date)).format("DD/MM/YYYY"),
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
                x: moment(new Date(val.date)).format("DD/MM/YYYY"),
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
                x: moment(new Date(val.date)).format("DD/MM/YYYY"),
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
                x: moment(new Date(val.date)).format("DD/MM/YYYY"),
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
                x: moment(new Date(val.date)).format("DD/MM/YYYY"),
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
                x: moment(new Date(val.date)).format("DD/MM/YYYY"),
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
                x: moment(new Date(val.date)).format("DD/MM/YYYY"),
                y: val.deleted,
              }
            : undefined;
        }),
        borderColor: "purple",
        fill: true,
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
          $dateFromParts: {
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
    console.log(userStatistics);

    const dataset: Dataset[] = [];
    dataset.push({
      label: "Registered Users",
      data: userStatistics.map((val) => {
        return {
          x: moment(new Date(val.date)).format("DD/MM/YYYY"),
          y: val.count,
        };
      }),
      borderColor: "green",
      fill: false,
    });
    return res.json(dataset).end();
  });
}
