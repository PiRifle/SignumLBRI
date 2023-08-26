import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { body, check, validationResult } from "express-validator";
import "../config/passport";
import { CallbackError, Error } from "mongoose";
import {
  IS_PROD,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_SHOWMAIL,
  MAIL_USER,
} from "../util/secrets";
import { School } from "../models/School";

/**
 * Login page.
 * @route GET /login
 */
export const getLogin = async (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect("/");
  }

  const documentCount = await User.countDocuments({})
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (documentCount[0]) {
    return req.flashError(documentCount[0], req.language.errors.internal);
  }

  if (documentCount[1] == 0) {
    return res.redirect("/setup");
  }

  res.render("account/login", {
    title: req.language.titles.login,
  });
};

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await check("email", req.language.errors.validate.emailInvalid)
    .isEmail()
    .run(req);
  await check("password", req.language.errors.validate.passwordBlank)
    .isLength({ min: 1 })
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flashError(null, errors.array(), false);
    return res.redirect("/login");
  }

  passport.authenticate(
    "local",
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flashError(null, info.message, false);
        return res.redirect("/login");
      }
      req.logIn(user, (err) => {
        if (err) return req.flashError(err, req.language.errors.internal);
        req.flash("success", { msg: req.language.success.loggedIn });
        res.redirect(req.session.returnTo || "/");
      });
    },
  )(req, res, next);
};

/**
 * Log out.
 * @route GET /logout
 */
export const logout = (req: Request, res: Response): void => {
  req.logout(() => {
    return null;
  });
  res.redirect("/");
};

export const getSetUp = async (req: Request, res: Response): Promise<void> => {
  const documentCount = await User.countDocuments()
    .then((a) => [null, a])
    .catch((a) => [a, null]);

  if (documentCount[0])
    return req.flashError(documentCount[0], req.language.errors.internal);

  const schools = await School.find({}, "_id name");

  if (documentCount[1] == 0) {
    return res.render("account/signup", {
      title: req.language.titles.setup,
      setup: true,
    });
  }

  if (req.user && req.user.isAdmin()) {
    return res.render("account/signup", {
      title: req.language.titles.setup,
      schools: schools,
    });
  }
  res.redirect("/signup");
};

/**
 * Signup page.
 * @route GET /signup
 */
export const getSignup = async (req: Request, res: Response): Promise<void> => {
  if (req.user && !req.user.isAdmin()) {
    return res.redirect("/");
  }

  const schools = await School.find({}, "_id name");

  if (!schools.length) {
    req.flash("info", { msg: req.language.info.registrationDisabled });
    return res.redirect("/");
  }

  res.render("account/signup", {
    title: req.language.titles.signup,
    signup: true,
    schools: schools,
  });
};

/**
 * Create a new local account.
 * @route POST /signup
 */
// TODO: check for permission bugs
export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userCount = await User.countDocuments();

  if (!req.body.role) req.body.role = "student";

  if (!["headadmin", "admin", "seller", "student"].includes(req.body.role)) {
    req.flash("errors", {
      msg: req.language.errors.roleNotExisting,
    });
    return res.redirect("/");
  }

  if (
    !(userCount == 0 || (req.user && req.user.isAdmin())) &&
    ["headadmin", "admin", "seller"].includes(req.body.role)
  ) {
    check("phone", req.language.errors.validate.phoneInvalid)
    .isMobilePhone("pl-PL")
    .run(req);
    
    req.flash("errors", {
      msg: req.language.errors.accountCreationPermissionDenied,
    });
    return res.redirect("/");
  }

  await check("email", req.language.errors.validate.emailInvalid)
    .isEmail()
    .run(req);
  await check("name", req.language.errors.validate.nameNotProvided)
    .exists()
    .isLength({ min: 1, max:99 })
    .run(req);
  await check("surname", req.language.errors.validate.surnameNotProvided)
    .exists()
    .isLength({ min: 1, max:99 })
    .run(req);
  await check("password", req.language.errors.validate.passwordInvalid)
    .isLength({ min: 4 })
    .run(req);
  await check("confirmPassword", req.language.errors.validate.passwordNotMatch)
    .equals(req.body.password)
    .run(req);
  if (!(req.body.role == "headadmin")) {
    const schools = await School.find({}, "_id");
    await check("school", req.language.errors.validate.schoolNameBlank)
      .exists()
      .isIn(schools.map((a) => a._id.toString()))
      .run(req);
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/");
  }

  if (await User.exists({ email: req.body.email }))
    return req.flashError(null, req.language.errors.accountAlreadyExists);

  const token = crypto.randomBytes(16).toString("hex");

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    profile: {
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
    },
    role: req.body.role,
    accountVerifyToken: token,
    ...(req.body.school && { school: req.body.school }),
  });

  const err = await user
    .save()
    .then((a) => null)
    .catch((err) => err);

  if (err) return req.flashError(err, req.language.errors.internal);

  if (!IS_PROD){ req.flash("info", {msg: "In Developement Mode, verification disabled"}); await (new Promise((resolve, reject)=>req.logIn(user, ()=>{resolve(2);}))); return res.redirect("/"); }

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: MAIL_SHOWMAIL,
    subject: "Zweryfikuj swoje konto",
    text: `
Witaj w SignumLBRI\n
Kliknij w link poniżej aby dokończyć rejestrację :))\n
http://${req.headers.host}/verify/${token}\n\n`,
  };

  const mail = await transporter
    .sendMail(mailOptions)
    .then((a) => [null, a])
    .catch((a) => [a, null]);

  if (mail[0]) return req.flashError(mail[0], req.language.errors.emailNotSent);

  if (mail[1]) {
    req.flash("success", {
      msg: req.language.success.accountVerifyPrompt,
    });
  }

  res.redirect("/");
};

/**
 * Profile page.
 * @route GET /account
 */
export const getAccount = (req: Request, res: Response): void => {
  res.render("account/profile", {
    title: req.language.titles.manage,
  });
};

/**
 * Update profile information.
 * @route POST /account/profile
 */
export const postUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await check("email", req.language.errors.validate.emailInvalid)
    .isEmail()
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/account");
  }

  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: UserDocument) => {
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
            msg: req.language.errors.accountAlreadyExists,
          });
          return res.redirect("/account");
        }
        return next(err);
      }
      req.flash("success", { msg: req.language.success.accountInfoUpdated });
      res.redirect("/account");
    });
  });
};

/**
 * Update current password.
 * @route POST /account/password
 */
export const postUpdatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await check("password", req.language.errors.validate.passwordInvalid)
    .isLength({ min: 4 })
    .run(req);
  await check("confirmPassword", req.language.errors.validate.passwordNotMatch)
    .equals(req.body.password)
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/account");
  }

  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err: WriteError & CallbackError) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: req.language.success.passwordChanged });
      res.redirect("/account");
    });
  });
};

/**
 * Delete user account.
 * @route POST /account/delete
 */
// TODO: check for bugs
export const postDeleteAccount = async (req: Request, res: Response) => {
  if (!req.user) return res.redirect("/");

  req.user.softDelete = true;
  req.user.realAddress = req.user.email;
  req.user.email = `${crypto.randomBytes(16).toString("hex")}@delete.me`;
  req.user.password = "";

  const out = await req.user
    .save()
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (out[0]) return req.flashError(out[0], req.language.errors.internal);

  req.logout(() => {
    null;
  });
  req.flash("success", { msg: req.language.success.accountDeleted });
  res.redirect("/");
};

/**
 * Reset Password page.
 * @route GET /reset/:token
 */
export const getReset = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  User.findOne({ passwordResetToken: req.params.token })
    .where("passwordResetExpires")
    .gt(Date.now())
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", {
          msg: req.language.errors.passwordResetTokenInvalid,
        });
        return res.redirect("/forgot");
      }
      res.render("account/reset", {
        title: req.language.titles.resetPassword,
      });
    });
};

// TODO: bugcheck
export const getVerify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await check("token", req.language.errors.validate.tokenNotProvided)
    .exists()
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return req.flashError(null, errors.array());
  const [findErr, user] = await User.findOne({
    accountVerifyToken: req.params.token,
  })
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (findErr) return req.flashError(findErr, req.language.errors.internal);
  if (!user)
    return req.flashError(null, req.language.errors.validate.tokenInvalid);
  user.accountVerifyToken = undefined;
  const [saveErr, _] = await (user as UserDocument)
    .save()
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (saveErr) return req.flashError(saveErr, req.language.errors.internal);
  req.logIn(user, () => {
    null;
  });
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: MAIL_SHOWMAIL,
    subject: "Twoje konto zostało poprawnie zweryfikowane",
    text: `Hejka,\n\n Konto ${user.email} właśnie zostało zarejestowane w systemie SignumLBRI.\n`,
  };

  const mail = await transporter
    .sendMail(mailOptions)
    .then((a) => [null, a])
    .catch((a) => [a, null]);

  if (mail[0]) return req.flashError(mail[0], req.language.errors.emailNotSent);

  if (mail[1]) {
    req.flash("success", {
      msg: req.language.success.accountVerified,
    });
  }

  res.redirect("/");
};

/**
 * Process the reset password request.
 * @route POST /reset/:token
 */
// TODO: make function async, fix error handling
export const postReset = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await check("password", req.language.errors.validate.passwordInvalid)
    .isLength({ min: 4 })
    .run(req);
  await check("confirm", req.language.errors.validate.passwordNotMatch)
    .equals(req.body.password)
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) return req.flashError(null, errors.array());

  const [findErr, user] = await User.findOne({
    passwordResetToken: req.params.token,
    accountVerifyToken: { $in: [null, ""] },
  })
    .where("passwordResetExpires")
    .gt(Date.now())
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (findErr) return req.flashError(findErr, req.language.errors.internal);
  if (!user)
    return req.flashError(
      null,
      req.language.errors.validate.passwordTokenInvalid,
    );
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  const [saveErr, _] = await (user as UserDocument)
    .save()
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (saveErr) return req.flashError(saveErr, req.language.errors.internal);
  req.logIn(user, () => {
    null;
  });
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: MAIL_SHOWMAIL,
    subject: "Twoje Hasło zostało zmienione",
    text: `Hejka,\n\n Właśnie ktoś zmienił hasło na koncie ${user.email}. Jeżeli to nie ty, skontaktuj się z administratorem systemu!\n`,
  };

  const [err, mail] = await transporter
    .sendMail(mailOptions)
    .then((a) => [null, a])
    .catch((a) => [a, null]);

  if (err) return req.flashError(err, req.language.errors.emailNotSent);

  if (mail) {
    req.flash("success", {
      msg: req.language.success.passwordChanged,
    });
  }

  res.redirect("/");
};

/**
 * Forgot Password page.
 * @route GET /forgot
 */
export const getForgot = (req: Request, res: Response): void => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.render("account/forgot", {
    title: req.language.titles.forgotPassword,
  });
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
// TODO: make function async, fix error handling
export const postForgot = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await check("email", req.language.errors.validate.emailInvalid)
    .isEmail()
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) return req.flashError(null, errors.array());

  const token = crypto.randomBytes(16).toString("hex");

  const [findErr, user] = await User.findOne({ email: req.body.email })
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (findErr) return req.flashError(findErr, req.language.errors.internal);
  if (!user)
    return req.flashError(null, req.language.errors.accountDoesntExist);

  user.passwordResetToken = token as unknown as string;
  user.passwordResetExpires = (Date.now() + 3600000) as unknown as Date; // 1 hour

  const [saveErr, _] = await (user as UserDocument)
    .save()
    .then((a) => [null, a])
    .catch((a) => [a, null]);
  if (saveErr) return req.flashError(saveErr, req.language.errors.internal);

  req.logIn(user, () => {
    null;
  });
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: MAIL_SHOWMAIL,
    subject: "Zresetuj swoje hasło!",
    text: `Kliknij w link poniżej aby dokończyć proces zmiany hasła!\n\n
          http://${req.headers.host}/reset/${token}\n\n
          Jeżeli to nie ty, nie ma obaw! Hasło pozostanie niezmienione :))\n`,
  };

  const mail = await transporter
    .sendMail(mailOptions)
    .then((a) => [null, a])
    .catch((a) => [a, null]);

  if (mail[0]) return req.flashError(mail[0], req.language.errors.emailNotSent);

  if (mail[1]) {
    req.flash("success", {
      msg: req.language.success.passwordResetInfo,
    });
  }

  res.redirect("/");
};

export const getResendVerify = (req: Request, res: Response): void => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("account/forgot", {
    title: "Forgot Password",
    resend: true,
  });
};
export const postResendVerify = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await check("email", req.language.errors.validate.emailInvalid).isEmail().run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/resendverify");
  }

  const user = req.user as UserDocument;

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: MAIL_USER, // generated ethereal user
      pass: MAIL_PASSWORD, // generated ethereal password
    },
  });
  const mailOptions = {
    to: user.email,
    from: MAIL_SHOWMAIL,
    subject: "Zweryfikuj konto",
    text: `
    Kliknij w link poniżej aby zweryfikować swoje konto:\n\n
    http://${req.headers.host}/verify/${user.accountVerifyToken}\n\n`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    req.flash("success", {
      msg: req.language.success.activationMailSent,
    });
    return res.redirect("/");
  });
};
