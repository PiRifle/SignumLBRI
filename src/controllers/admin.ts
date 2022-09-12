import {Request, Response} from "express";
import { BookListing } from "../models/BookListing";

function getModificationsForDuration(startDate:Date, endDate:Date){
     BookListing.aggregate([
      {
        $match: {
        $or:[
          {createdAt: {
            $gt: startDate,
            $lt: endDate,
          }},
          {whenPrinted: {
            $gt: startDate,
            $lt: endDate,
          }},
          {whenVerified: {
            $gt: startDate,
            $lt: endDate,
          }},
          {whenSold: {
            $gt: startDate,
            $lt: endDate,
          }},
          {whenCanceled: {
            $gt: startDate,
            $lt: endDate,
          }},
          {whenGivedMoney: {
            $gt: startDate,
            $lt: endDate,
          }},
          {whenDeleted: {
            $gt: startDate,
            $lt: endDate,
          }},
        ]
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
              type: "givenmoney",
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
          _id: {
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
            second: {
              $second: "$dates.date",
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
          givenmoney: {
            $sum: {
              $cond: {
                if: {
                  $eq: ["$dates.type", "givenmoney"],
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
    ]).exec((err: Error, result)=>{
        console.log(result);
    });
}
export function main(req: Request, res: Response): void{
    console.log(
      getModificationsForDuration(
        new Date(Date.parse("11 09 2022 00:12:00 GMT")),
        new Date()
      )
    );
    res.render("admin/page/dashboard");
}
