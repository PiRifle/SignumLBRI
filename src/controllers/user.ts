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
import { Token } from "nodemailer/lib/xoauth2";
import { MAIL_HOST, MAIL_PASSWORD, MAIL_SHOWMAIL, MAIL_USER } from "../util/secrets";

/**
 * Login page.
 * @route GET /login
 */
export const getLogin = (req: Request, res: Response): void => {
    if (req.user) {
        return res.redirect("/");
    }
    User.countDocuments({}, (err: NativeError, count: number)=>{
        if (err){
            req.flash("errors", {msg:err.message});
            return res.redirect("/");
        }
        if(count == 0){
            return res.redirect("/setup");
        }else{
            res.render("account/login", {
                title: "Login",
            });
        }
    });
    
};

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/login");
    }

    passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash("errors", {msg: info.message});
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash("success", { msg: "Success! You are logged in." });
            res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};

export const postLoginApp = async (req: Request, res: Response, next: NextFunction): Promise<Response<never, Record<string, undefined>>> => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
    passport.authenticate(
      "local",
      (err: Error, user: UserDocument, info: IVerifyOptions) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(400).json({ msg: info.message });
          
        }
        req.logIn(user, (err) => {
          if (err) {
            return res.status(400).json({ msg: err });
            // return next(err);
          }
          return res.json({msg: "logged_in"}).end();
        });
      }
    )(req, res, next);

};
/**
 * Log out.
 * @route GET /logout
 */
export const logout = (req: Request, res: Response): void => {
    req.logout(()=>{return null;},);
    res.redirect("/");
};

/**
 * Signup page.
 * @route GET /signup
 */
export const getSetUp = async (req: Request, res: Response): Promise<void> => {
  if (req.user) {
    if ((req.user as UserDocument).role != "admin") {
      return res.redirect("/");
    }
  }
  User.countDocuments({}, (err: NativeError, count: number) => {
    if (err) {
      req.flash("errors", { msg: err.message });
      return res.redirect("/");
    }
    if (count == 0) {
      res.render("account/signup", {
        title: "Create Account",
        setup: true,
      });
    } else {
      res.render("account/signup", {
        title: "Create Account",
      });
    }
  });
};

export const getSignup = async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/signup", {
        title: "Create Account",
        signup: true
    });

};

/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("name", "name not valid").exists().run(req);
    await check("surname", "surname not valid").exists().run(req);
    // if(!req.user) {await check("phone", "phone is invalid").isMobilePhone("pl-PL").run(req)}
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
    if (!req.body.role) req.body.role = "student";
        
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/");
    }

    const user = new User({
      email: req.body.email,
      password: req.body.password,
      profile: {
          name: req.body.name,
          surname: req.body.surname,
          phone: req.body.phone,
      },
      role: req.body.role,
    });
    User.findOne({ email: req.body.email }, (err: NativeError, existingUser: UserDocument) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash("errors", { msg: "Konto z tym adresem email ju?? istnieje" });
            return res.redirect("/");
        }
        async.waterfall(
          [
            function createRandomToken(
                done: (err: Error, token: string, user:UserDocument) => void
            ) {
              crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString("hex");
                done(err, token, user);
              });
            },
            function setRandomToken(
              token: AuthToken,
              user: UserDocument,
              done: (
                err: NativeError | WriteError,
                token: AuthToken,
                user: UserDocument
              ) => void
            ) {
                  if (!user) {
                    req.flash("errors", {
                      msg: "Konto z tym adresem email nie istnieje",
                    });
                    return res.redirect("/");
                  }
                  user.accountVerifyToken = (token as unknown as string);
                  user.save((err: Error, user) => {
                    done(err, token, user);
                }
              );
            },
            function sendVerifyEmail(
                token: Token, user: UserDocument,
              done: (err: Error, user: UserDocument) => void
            ) {
              // const transporter = nodemailer.createTransport({
              //     service: "SendGrid",
              //     auth: {
              //         user: process.env.SENDGRID_USER,
              //         pass: process.env.SENDGRID_PASSWORD
              //     }
              // });


              // create reusable transporter object using the default SMTP transport
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
                subject: "Zweryfikuj swoje konto",
                text: `
          Witaj w SignumLBRI\n
          Kliknij w link poni??ej aby doko??czy?? rejestracj?? :))\n
          http://${req.headers.host}/verify/${token}\n\n`,
              };
              transporter.sendMail(
                  mailOptions,
                  (err, info) => {
                      console.log(
                          "Preview URL: %s",
                          nodemailer.getTestMessageUrl(info)
                      );
                      req.flash("success", {
                          msg: "Stworzono konto",
                      });
                      done(err, user);
                  }
              );       


            },
            function saveUser(user: UserDocument, done: (err: Error) => void){
                if(err) return done(err);
                user.save((err:Error ) => {
                    if (err) { return done(err); }
    
                // req.logIn(user, (err) => {
                // if (err) {
                //     return next(err);
                //     }
                // });
                });
                done(err);
            }
          ],
          (err) => {
            if (err) {
              return next(err);
            }
            req.flash("success", {
              msg: "Zarejestrowa??e?? si??! Sprawd?? skrzynk?? mailow?? aby zweryfikowa?? maila",
            });
            res.redirect("/");
          }
        );
        
    });

};

/**
 * Profile page.
 * @route GET /account
 */
export const getAccount = (req: Request, res: Response): void => {
    res.render("account/profile", {
        title: "Account Management"
    });
};

/**
 * Update profile information.
 * @route POST /account/profile
 */
export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err: NativeError, user: UserDocument) => {
        if (err) { return next(err); }
        user.email = req.body.email || "";
        user.profile.name = req.body.name || "";
        user.profile.surname = req.body.surname || "";
        user.profile.gender = req.body.gender || "";
        user.profile.location = req.body.location || "";
        user.profile.website = req.body.website || "";
        user.save((err: WriteError & CallbackError) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
                    return res.redirect("/account");
                }
                return next(err);
            }
            req.flash("success", { msg: "Profile information has been updated." });
            res.redirect("/account");
        });
    });
};

/**
 * Update current password.
 * @route POST /account/password
 */
export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err: NativeError, user: UserDocument) => {
        if (err) { return next(err); }
        user.password = req.body.password;
        user.save((err: WriteError & CallbackError) => {
            if (err) { return next(err); }
            req.flash("success", { msg: "Password has been changed." });
            res.redirect("/account");
        });
    });
};

/**
 * Delete user account.
 * @route POST /account/delete
 */
// export const postDeleteAccount = (req: Request, res: Response, next: NextFunction): void => {
//     const user = req.user as UserDocument;
//     User.remove({ _id: user.id }, (err) => {
//         if (err) { return next(err); }
//         req.logout(()=>{return null;});
//         req.flash("info", { msg: "Your account has been deleted." });
//         res.redirect("/");
//     });
// };
export const postDeleteAccount = (req: Request, res: Response, next: NextFunction): void => {
    // const user = req.user as UserDocument;
    // User.remove({ _id: user.id }, (err) => {
        // if (err) { return next(err); }
        // req.logout(()=>{return null;});
        req.flash("info", { msg: "Niestety Ta Funkcjonalno???? nie jest jeszcze dzia??aj??ca" });
        res.redirect("/");
    // });
};

// /**
//  * Unlink OAuth provider.
//  * @route GET /account/unlink/:provider
//  */
// export const getOauthUnlink = (req: Request, res: Response, next: NextFunction): void => {
//     const provider = req.params.provider;
//     const user = req.user as UserDocument;
//     User.findById(user.id, (err: NativeError, user: UserDocument) => {
//         if (err) { return next(err); }
//         user[provider] = undefined;
//         user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
//         user.save((err: WriteError) => {
//             if (err) { return next(err); }
//             req.flash("info", { msg: `${provider} account has been unlinked.` });
//             res.redirect("/account");
//         });
//     });
// };

/**
 * Reset Password page.
 * @route GET /reset/:token
 */
export const getReset = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires").gt(Date.now())
        .exec((err, user) => {
            if (err) { return next(err); }
            if (!user) {
                req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                return res.redirect("/forgot");
            }
            res.render("account/reset", {
                title: "Password Reset"
            });
        });
};

export const getVerify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("token", "No token provided").exists().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("back");
    }

    async.waterfall([
        function updateVerify(done: (err: Error, user: UserDocument) => void) {
            User
                .findOne({ accountVerifyToken: req.params.token })
                .exec((err, user: UserDocument) => {
                    if (err) { return next(err); }
                    if (!user) {
                        req.flash("errors", { msg: "Account token is invalid or has expired." });
                        return res.redirect("back");
                    }
                    
                    user.accountVerifyToken = undefined;
                    user.save((err: Error) => {
                        if (err) { return next(err); }
                        req.logIn(user, (err) => {
                            done(err, user);
                        });
                    });
                });
        },
        async function sendVerifyAccountEmail(user: UserDocument, done: (err: Error) => void) {
            // const transporter = nodemailer.createTransport({
            //     service: "SendGrid",
            //     auth: {
            //         user: process.env.SENDGRID_USER,
            //         pass: process.env.SENDGRID_PASSWORD
            //     }
            // });

            // create reusable transporter object using the default SMTP transport
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
                subject: "Twoje konto zosta??o poprawnie zweryfikowane",
                text: `Hejka,\n\n Konto ${user.email} w??a??nie zosta??o zarejestowane w systemie SignumLBRI.\n`
            };
            await transporter.sendMail(mailOptions, (err, info) => {
              console.log(
                "Preview URL: %s",
                nodemailer.getTestMessageUrl(info)
              );
              req.flash("success", {
                msg: "Success! Your password has been changed.",
              });
              done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect("/");
    });
};



/**
 * Process the reset password request.
 * @route POST /reset/:token
 */
export const postReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("password", "Password must be at least 4 characters long.").isLength({ min: 4 }).run(req);
    await check("confirm", "Passwords must match.").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("back");
    }

    async.waterfall([
        function resetPassword(done: (err: Error, user: UserDocument) => void) {
            User
                .findOne({ passwordResetToken: req.params.token, accountVerifyToken: {$in:[null, ""]}})
                .where("passwordResetExpires").gt(Date.now())
                .exec((err, user: UserDocument) => {
                    if (err) { return next(err); }
                    if (!user) {
                        req.flash("errors", { msg: "Password reset token is invalid, has expired or your account isn't verified." });
                        return res.redirect("back");
                    }
                    user.password = req.body.password;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;
                    user.save((err: Error) => {
                        if (err) { return next(err); }
                        req.logIn(user, (err) => {
                            done(err, user);
                        });
                    });
                });
        },
        async function sendResetPasswordEmail(user: UserDocument, done: (err: Error) => void) {
            // const transporter = nodemailer.createTransport({
            //     service: "SendGrid",
            //     auth: {
            //         user: process.env.SENDGRID_USER,
            //         pass: process.env.SENDGRID_PASSWORD
            //     }
            // });
            // const testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
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
                subject: "Twoje Has??o zosta??o zmienione",
                text: `Hejka,\n\n W??a??nie kto?? zmieni?? has??o na koncie ${user.email}. Je??eli to nie ty, skontaktuj si?? z administratorem systemu!\n`
            };
            await transporter.sendMail(mailOptions, (err, info) => {
              console.log(
                "Preview URL: %s",
                nodemailer.getTestMessageUrl(info)
              );
              req.flash("success", {
                msg: "Gratulacje! Twoje has??o do konta zosta??o zmienione.",
              });
              done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect("/");
    });
};

/**
 * Forgot Password page.
 * @route GET /forgot
 */
export const getForgot = (req: Request, res: Response): void => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
export const postForgot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/forgot");
    }

    async.waterfall([
        function createRandomToken(done: (err: Error, token: string) => void) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString("hex");
                done(err, token);
            });
        },
        function setRandomToken(token: AuthToken, done: (err: NativeError | WriteError, token?: AuthToken, user?: UserDocument) => void) {
            User.findOne({ email: req.body.email }, (err: NativeError, user: UserDocument) => {
                if (err) { return done(err); }
                if (!user) {
                    req.flash("errors", { msg: "Konto z tym adresem email nie istnieje!" });
                    return res.redirect("/forgot");
                }
                user.passwordResetToken = (token as unknown as string);
                user.passwordResetExpires = (Date.now() + 3600000 as unknown as Date); // 1 hour
                user.save((err: Error) => {
                    done(err, token, user);
                });
            });
        },
        async function sendForgotPasswordEmail(token: AuthToken, user: UserDocument, done: (err: Error) => void) {
            // const testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
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
                subject: "Zresetuj swoje has??o!",
                text: `Kliknij w link poni??ej aby doko??czy?? proces zmiany has??a!\n\n
          http://${req.headers.host}/reset/${token}\n\n
          Je??eli to nie ty, nie ma obaw! Has??o pozostanie niezmienione :))\n`
            };
            transporter.sendMail(mailOptions, (err, info) => {
                console.log(
                  "Preview URL: %s",
                  nodemailer.getTestMessageUrl(info)
                );
                req.flash("info", { msg: `Wys??ali??my maila na adres ${user.email} z instrukcjami odno??nie zmiany has??a.` });
                done(err);
            });
            // console.log("Message sent: %s", info.messageId);
            // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // // Preview only available when sending through an Ethereal account
            
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect("/forgot");
    });
};

export const getResendVerify = (req: Request, res: Response): void => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("account/forgot", {
    title: "Forgot Password",
    resend: true
  });
};
export const postResendVerify = async (req: Request, res: Response): Promise<void> => {
  // const transporter = nodemailer.createTransport({
  //     service: "SendGrid",
  //     auth: {
  //         user: process.env.SENDGRID_USER,
  //         pass: process.env.SENDGRID_PASSWORD
  //     }
  // });
    await check("email", "Podaj poprawny adres email.")
    .isEmail()
    .run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/resendverify");
    }


    const user = req.user as UserDocument;
    // create reusable transporter object using the default SMTP transport
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
    Kliknij w link poni??ej aby zweryfikowa?? swoje konto:\n\n
    http://${req.headers.host}/verify/${user.accountVerifyToken}\n\n`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      req.flash("success", {
        msg: "Sukces, Mail aktywacyjny zosta?? wys??any!",
      });
      return res.redirect("/");
    });
};
export const getPing = (req: Request, res: Response): void => {
    res.json({msg:"ping"});
};

