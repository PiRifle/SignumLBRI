import { Book, BookDocument } from "../models/Book";

export function calculateComission(price: number, divisibleBy: number, comissionMultiplier: number): number {
  price = Number(price);
  const comission = price * comissionMultiplier;
  return price + (comission % Math.round(divisibleBy)) == 0
    ? price + comission
    : 2 - ((price + comission) % 2) + comission;
}

export async function fetchTopBooks(): Promise<
  (BookDocument & { available: number; sold: number })[]
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
      $sort: {
        available: -1,
      },
    },
  ]);

  return result;
}
