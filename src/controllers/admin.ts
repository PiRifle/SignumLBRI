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
import { School, SchoolDocument } from "../models/School";
import { getBookGraph, getBookStats, getBuyerStats, getGlobalStats, getRoleTime, getStaffStatistics, getStatsPerUser, getUser, getUserGraph } from "../util/admin";
import { error } from "console";
import { ObjectID, ObjectId } from "bson";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
durationFormat(moment);


export async function adminDataProvider(req: Request, res: Response, next: NextFunction) {
  res.locals.requestData = { params: {}, query: {} };
  if (req.user.isHeadAdmin()) {
    res.locals.availableSchools = await School.find({});
  } else {
    res.locals.availableSchools = await School.find({ _id: req.user.school });
  }

  next();
}

export async function checkSchoolPermissions(req: Request, res: Response, next: NextFunction) {
  if (req.params.schoolID && (res.locals.availableSchools as SchoolDocument[]).every((a) => a._id.toString() != req.params.schoolID.toString())) {
    return res.redirect("/");
  }
  next();
}


export async function main(req: Request, res: Response): Promise<void> {
  req.params = res.locals.requestData.params
  const data = await getRoleTime(req.params.schoolID ? new ObjectId(req.params.schoolID) : undefined);
  data.forEach((role: { formattedAvg: string, formattedSum: string, avg: number, sum: number, _id: string }) => {
    role.formattedAvg = moment
      .duration(role.avg, "milliseconds")
      .format("w[w] d[d] h[h] m[m] s[s]");
    role.formattedSum = moment
      .duration(role.sum, "milliseconds")
      .format("w[w] d[d] h[h] m[m] s[s]");
  });
  res.render("admin/page/dashboard", { title: req.language.titles.adminDashboard, data: data });
}
export async function users(req: Request, res: Response): Promise<void> {
  req.params = res.locals.requestData.params
  const stats = await getGlobalStats(undefined, req.params.schoolID ? new ObjectId(req.params.schoolID) : undefined);
  const userData = await getStatsPerUser(undefined, req.params.schoolID ? new ObjectId(req.params.schoolID) : undefined);
  const staff = await getStaffStatistics(Boolean(req.params.schoolID), req.params.schoolID ? new ObjectId(req.params.schoolID) : undefined);
  // console.log(stats);
  res.render("admin/page/users", {
    title: "Users",
    stats: stats[0],
    userData: userData,
    staff: staff,
  });
}

// [2, 3, 4, ...(false ? [2,3,4] : []), 8, 7]

export async function buyers(req: Request, res: Response): Promise<void> {
  req.params = res.locals.requestData.params
  const data = await getBuyerStats(req.params.schoolID ? new ObjectId(req.params.schoolID) : undefined);
  let sum;
  try {
    sum = data
      .map((value) => {
        return value.moneySpent;
      })
      .reduce((partialSum, a) => partialSum + a, 0);
  } catch (_) { }
  res.render("admin/page/buyers", {
    title: "Buyers",
    buyers: data,
    buyerSum: sum,
  });
}

export async function books(req: Request, res: Response): Promise<void> {
  req.params = res.locals.requestData.params

  const result = await getBookStats(undefined, req.params.schoolID ? new ObjectId(req.params.schoolID) : undefined);
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

  const [err, bookStatistics] = await getBookGraph(from, to, exact);

  if (err) {
    return res.status(500).end();
  }

  const dataset: Dataset[] = [];
  dataset.push({
    label: "Books Created",
    data: bookStatistics.map((val) => {
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
    data: bookStatistics.map((val) => {
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
    data: bookStatistics.map((val) => {
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
    data: bookStatistics.map((val) => {
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
    data: bookStatistics.map((val) => {
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
    data: bookStatistics.map((val) => {
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
    data: bookStatistics.map((val) => {
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

    data.data.sort(
      (a, b) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        new Date(moment(a.x, "DD/MM/YYYY/HH:mm:ss")) -
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        new Date(moment(b.x, "DD/MM/YYYY/HH:mm:ss")),
    );
  });
  return res.json(dataset).end();

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


  const [err, userStatistics] = await getUserGraph(from, to, exact);
  if (err) {
    return res.status(500).end();
  }
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
}

export const getEditUser = async (req: Request, res: Response) => {
  await check("userID").exists().run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("back");
  }
  const user = await (getUser(new ObjectID(req.params.userID)));
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

export const postEditUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await check("userID").exists().run(req);

  await check("email", req.language.errors.validate.emailInvalid)
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
          req.flashError(null, req.language.errors.accountAlreadyExists);
          return res.redirect("/admin");
        }
        return next(err);
      }
      req.flash("success", { msg: req.language.success.accountInfoUpdated });
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

  const [err, listings] = await BookListing.find({
    bookOwner: req.params.userID,
    status: { $in: ["sold", "accepted"] },
  }).then(a => [null, a]).catch(a => [a, null]);

  if (err) {
    req.flashError(err, req.language.errors.internal, false);
    return res.redirect("back");
  }

  listings.forEach((listing: BookListingDocument) => {
    listing.status = "given_money";
    listing.whenGivenMoney = new Date();
    listing.givenMoneyBy = req.user as UserDocument;
    listing.save((err) => {
      req.flashError(err, req.language.errors.internal, false);
    });
  });

  req.flash("success", { msg: req.language.success.moneyGiven });
  return res.redirect("back");
};
