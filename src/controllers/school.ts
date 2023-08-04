import { Request, Response, NextFunction } from "express";
import { SchoolDocument, School } from "../models/School";
import { check, validationResult } from "express-validator";
import multer, { memoryStorage } from "multer";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const storage = multer({
  storage: memoryStorage(),
  limits: { fileSize: 1000000 * 10 },
}).single("icon");

const storageMiddleware = (req: Request, res: Response) =>
  new Promise((resolve, reject) => {
    storage(req, res, (err) => {
      if (err) return reject(err);
      return resolve(null);
    });
  });

// export const getSchoolIcon = async () => {

// };

export const getRegisterSchool = async (req: Request, res: Response) => {
  if (!(req.user && req.user.isHeadAdmin())) {
    return res.redirect("/");
  }

  res.render("school/add");
};

export const postRegisterSchool = async (req: Request, res: Response) => {
  if (!(req.user && req.user.isHeadAdmin())) {
    return res.redirect("/");
  }

  await storageMiddleware(req, res);

  await check("commission", req.language.errors.validate.schoolComissionMultiplierInvalid)
  .exists()
  .isFloat({lt:1, gt:0.01})
  .run(req);

  await check("name", req.language.errors.validate.schoolNameBlank)
    .exists()
    .isLength({ min: 1 })
    .run(req);
  await check("street", req.language.errors.validate.schoolstreetBlank)
    .exists()
    .isLength({ min: 1 })
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) return req.flashError(null, errors.array());

  console.log(req.body);

  const school = new School({
    name: req.body.name,
    longName: req.body.longname || req.body.name,
    street: req.body.street,
    markup: req.body.comission
  });

  if (req.file) {
    const file = req.file;
    if (
      ![".png", ".jpeg", ".jpg", ".webp"].includes(
        path.extname(file.originalname),
      )
    ) {
      return req.flashError(null, "File type is wrong format");
    }
    const img = await sharp(file.buffer).resize(200).webp();

    const { dominant } = await img.stats();
    const dominantHex = `#${dominant.r.toString(16)}${dominant.g.toString(
      16,
    )}${dominant.b.toString(16)}`;
    const icon = `data:image/webp;base64,${(await img.toBuffer()).toString(
      "base64",
    )}`;
    school.icon = icon;
    school.color = dominantHex;
  } else {
    school.color = "#999999";
  }

  const err = await school
    .save()
    .then((a) => null)
    .catch((err) => err);

  if (err) return req.flashError(err, req.language.errors.internal);

  req.flash("success", {
    msg: req.language.success.schoolCreated,
  });

  res.redirect("/");
};

export const getModifySchool = async (req: Request, res: Response) => {
  if (!(req.user && req.user.isHeadAdmin())) {
    return res.redirect("/");
  }
};

export const postModifySchool = async (req: Request, res: Response) => {
  if (!(req.user && req.user.isHeadAdmin())) {
    return res.redirect("/");
  }
};

export const postDeleteSchool = async (req: Request, res: Response) => {
  if (!(req.user && req.user.isHeadAdmin())) {
    return res.redirect("/");
  }
};

export const getSchoolHome = async (
  req: Request,
  res: Response,
): Promise<any> => {
  return null;
};
