import passport from "passport";
import passportLocal from "passport-local";
// import passportFacebook from "passport-facebook";
// import passportBearer from "passport-http-bearer
import { find } from "lodash";

// import { User, UserType } from '../models/User';
import { User, UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";

const LocalStrategy = passportLocal.Strategy;
// const FacebookStrategy = passportFacebook.Strategy;
// const BearerStrategy = passportBearer.Strategy;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser<any, any>((req, user, done) => {
  done(undefined, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err: NativeError, user: UserDocument) => done(err, user));
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne(
      { email: email.toLowerCase(), accountVerifyToken: { $in: [null, ""] } },
      (err: NativeError, user: UserDocument) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(undefined, false, {
            message: `Email ${email} not found or account not activated!.`,
          });
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(undefined, user);
          }
          return done(undefined, false, {
            message: "Invalid email or password.",
          });
        });
      },
    );
  }),
);
// passport.use(
//   new BearerStrategy(
//     function(token, done) {
//       User.findOne({
//         token: token
//       }, function(err:NativeError, user: UserDocument) {
//         if (err) {
//           return done(err);
//         }
//         if (!user) {
//           return done(null, false);
//         }
//         return done(null, user);
//       });
//     }
//   )
// );

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

// /**
//  * Sign in with Facebook.
//  */
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_ID,
//     clientSecret: process.env.FACEBOOK_SECRET,
//     callbackURL: "/auth/facebook/callback",
//     profileFields: ["name", "email", "link", "locale", "timezone"],
//     passReqToCallback: true
// }, (req: Request, accessToken, refreshToken, profile, done) => {
//     if (req.user) {
//         User.findOne({ facebook: profile.id }, (err: NativeError, existingUser: UserDocument) => {
//             if (err) { return done(err); }
//             if (existingUser) {
//                 req.flash("errors", { msg: "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
//                 done(err);
//             } else {
//                 User.findById(req.user.id, (err: NativeError, user: UserDocument) => {
//                     if (err) { return done(err); }
//                     user.facebook = profile.id;
//                     user.tokens.push({ kind: "facebook", accessToken });
//                     user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
//                     user.profile.gender = user.profile.gender || profile._json.gender;
//                     user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
//                     user.save((err: Error) => {
//                         req.flash("info", { msg: "Facebook account has been linked." });
//                         done(err, user);
//                     });
//                 });
//             }
//         });
//     } else {
//         User.findOne({ facebook: profile.id }, (err: NativeError, existingUser: UserDocument) => {
//             if (err) { return done(err); }
//             if (existingUser) {
//                 return done(undefined, existingUser);
//             }
//             User.findOne({ email: profile._json.email }, (err: NativeError, existingEmailUser: UserDocument) => {
//                 if (err) { return done(err); }
//                 if (existingEmailUser) {
//                     req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings." });
//                     done(err);
//                 } else {
//                     const user: any = new User();
//                     user.email = profile._json.email;
//                     user.facebook = profile.id;
//                     user.tokens.push({ kind: "facebook", accessToken });
//                     user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
//                     user.profile.gender = profile._json.gender;
//                     user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
//                     user.profile.location = (profile._json.location) ? profile._json.location.name : "";
//                     user.save((err: Error) => {
//                         done(err, user);
//                     });
//                 }
//             });
//         });
//     }
// }));

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
export const isAuthenticatedApp = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403).json({ msg: "not_logged_in" });
};
export const isSeller = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = req.user as UserDocument;
  if (user.isSeller()) {
    return next();
    // req.user()
  }
  res.redirect("/login");
};
export const isAnonymous = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return res.redirect("/library");
  }
  return next();
};
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = req.user as UserDocument;
  if (user.isAdmin()) {
    return next();
  }
  res.redirect("/login");
};

export const isHeadAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = req.user as UserDocument;
  if (user.isHeadAdmin()) {
    return next();
  }
  res.redirect("/login");
};


export const isSellerApp = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = req.user as UserDocument;
  if (user.isSeller()) {
    return next();
    // req.user()
  }
  res.status(403).json({ msg: "not_authorized" });
};
/**
 * Authorization Required middleware.
 */
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const provider = req.path.split("/").slice(-1)[0];

  const user = req.user as UserDocument;
  if (find(user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
