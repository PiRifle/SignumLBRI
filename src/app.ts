import express, { RequestHandler, Response, Request } from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET, version } from "./util/secrets";
import MobileDetect from "mobile-detect";
// Controllers (route handlers)
import * as performanceController from "./controllers/performance";
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as adminController from "./controllers/admin";
import * as schoolController from "./controllers/school";
import * as errorController from "./controllers/errors";
// import * as apiController from "./controllers/api";
// import * as contactController from "./controllers/contact";
import * as bookController from "./controllers/book";

import * as imageController from "./controllers/image";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";
// import { languageMiddleware } from "./controllers/language";
import { languageMiddleware, changeLanguage } from "./controllers/language";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose
  .connect(mongoUrl, {})
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch((err) => {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`,
    );
    // process.exit();
  });

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json() as RequestHandler);
app.use(bodyParser.urlencoded({ extended: true }) as RequestHandler);
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
      mongoUrl,
    }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  res.locals.device = new MobileDetect(req.headers["user-agent"]);
  res.locals.version = version.hash;
  next();
});
app.use((req, res, next) => {
  req.flashError = (err, msg, redirect = true) => {
    if (err) console.error(err);

    if (Array.isArray(msg)) {
      req.flash("errors", msg);
    } else {
      req.flash("errors", { msg });
    }

    if (redirect) res.redirect("/");
  };
  next();
});
app.use(languageMiddleware);
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user &&
    req.path !== "/login" &&
    req.path !== "/adduser" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)
  ) {
    req.session.returnTo = req.path;
  } else if (req.user && req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }),
);
app.use(performanceController.registerPerformance);
/**
 * Primary app routes.
 */
// app.get("/contact", contactController.getContact);
// app.post("/contact", contactController.postContact);
app.get("/", passportConfig.isAnonymous, homeController.index);
app.get("/privacy", homeController.policy);
app.post("/error/send", errorController.postError);
app.get("/library", bookController.getLibrary);
app.post("/language", changeLanguage);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", passportConfig.isAuthenticated, userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/verify/:token", userController.getVerify);
app.get("/resendverify", userController.getResendVerify);
app.get("/setup", userController.getSetUp);
app.post("/setup", userController.postSignup);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post(
  "/account/profile",
  passportConfig.isAuthenticated,
  userController.postUpdateProfile,
);
app.post(
  "/account/password",
  passportConfig.isAuthenticated,
  userController.postUpdatePassword,
);
app.post(
  "/account/delete",
  passportConfig.isAuthenticated,
  userController.postDeleteAccount,
);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated);

/**
 * API examples routes.
 */
// app.get("/api", apiController.getApi);
// app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
// app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
// app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
//     res.redirect(req.session.returnTo || "/");
// });

// app.get("/book/registry", passportConfig.isAuthenticated, bookController.getBookRegistry);
// app.get("/book/list", passportConfig.isAuthenticated, bookController.getBooks);
// app.get("/book/sell", passportConfig.isAuthenticated, bookController.getSellBook);
// app.post("/book/sell", passportConfig.isAuthenticated, passportConfig.isSeller, bookController.postSellBook);
// app.get("/book/:itemID", passportConfig.isAuthenticated, bookController.editBook);
// app.post("/book/:itemID/sell", passportConfig.isAuthenticated, passportConfig.isSeller, bookController.sellBook);
app.get(
  "/find",
  passportConfig.isAuthenticated,
  passportConfig.isSeller,
  bookController.getFindListing,
);

app.get(
  "/book/add",
  passportConfig.isAuthenticated,
  bookController.getSellBook,
);
app.post(
  "/book/add",
  passportConfig.isAuthenticated,
  bookController.postSellBook,
);

app.get(
  "/book/fromisbn",
  passportConfig.isAuthenticated,
  bookController.getFillBookData,
);

app.get("/book/:id/image", imageController.getBookCover);

app.get(
  "/book/registry",
  passportConfig.isAuthenticated,
  passportConfig.isSeller,
  bookController.getBookRegistry,
);
app.get(
  "/book/:id/manage",
  passportConfig.isAuthenticated,
  bookController.getManageBook,
);
app.post(
  "/book/:id/accept",
  passportConfig.isAuthenticated,
  passportConfig.isSeller,
  bookController.acceptBook,
);
app.post(
  "/book/:id/sell",
  passportConfig.isAuthenticated,
  passportConfig.isSeller,
  bookController.sellBook,
);
app.post(
  "/book/:id/cancel",
  passportConfig.isAuthenticated,
  bookController.cancelBook,
);
app.post(
  "/book/:id/delete",
  passportConfig.isAuthenticated,
  passportConfig.isAdmin,
  bookController.deleteBook,
);
app.get("/label", passportConfig.isAuthenticated, bookController.getPrintSetup);
app.get(
  "/label/print",
  passportConfig.isAuthenticated,
  bookController.getPrintLabel,
);
app.get(
  "/label/print/success",
  passportConfig.isAuthenticated,
  bookController.redirectPrintSuccess,
);
app.get(
  "/label/registerprints",
  passportConfig.isAuthenticated,
  bookController.getRegisterPrint,
);
app.get(
  "/label/:id",
  passportConfig.isAuthenticated,
  bookController.redirectPrint,
);
app.get(
  "/bulk",
  passportConfig.isAuthenticated,
  passportConfig.isSeller,
  bookController.getBulkSell,
);
app.post(
  "/bulk",
  passportConfig.isAuthenticated,
  passportConfig.isSeller,
  bookController.postBulkSell,
);
app.get(
  "/listingJSON",
  passportConfig.isAuthenticated,
  passportConfig.isSeller,
  bookController.listingJSON,
);

app.get(
  "/school/add",
  passportConfig.isAuthenticated,
  passportConfig.isAdmin,
  schoolController.getRegisterSchool,
);

app.post(
  "/school/add",
  passportConfig.isAuthenticated,
  passportConfig.isAdmin,
  schoolController.postRegisterSchool,
);

app.get("/school/:schoolID/logo", imageController.getSchoolLogo);

const adminApiRoutes = express.Router();

adminApiRoutes.get("/users", adminController.apiUsers);
adminApiRoutes.get("/books", adminController.apiBooks);

const adminRoutes = express.Router();

adminRoutes.use(
  passportConfig.isAuthenticated,
  passportConfig.isAdmin,
  adminController.adminDataProvider
);

const adminSchoolRoutes = express.Router();

adminSchoolRoutes.get(
  "/",
  adminController.main,
);

adminSchoolRoutes.get(
  "/users",
  adminController.users,
);

adminSchoolRoutes.get(
  "/buyers",
  adminController.buyers,
);

adminSchoolRoutes.get(
  "/books",
  adminController.books,
);

adminSchoolRoutes.get(
  "/earnings",
  adminController.earnings,
);

// adminRoutes.use("/:schoolID", (req, res, next) => {res.locals.requestData = {query: req.query, params: req.params}; next();},  adminController.checkSchoolPermissions, adminSchoolRoutes);

adminRoutes.get("/", (req, res)=>res.redirect("/admin/school"));
adminRoutes.use("/school/:schoolID?/",
  (req, res, next) => {res.locals.requestData = {query: req.query, params: req.params, page:req.path}; next();}, 
  // (req, res, next) => {console.log(req.path); next()},
  (req, res, next)=>{if(req.user.isHeadAdmin() || req.params.schoolID) return next(); else return res.redirect(`/admin/school/${res.locals.availableSchools[0]._id}`);}, 
  adminController.checkSchoolPermissions, 
  adminSchoolRoutes);
adminRoutes.use("/api/", adminApiRoutes);

adminRoutes.get(
  "/user/:userID/",
  (req: Request, res: Response) => {
    res.redirect(`/admin/user/${req.params.userID}/manage`);
  },
);

adminRoutes.get(
  "/user/:userID/manage",
  adminController.getEditUser,
);
adminRoutes.post(
  "/user/:userID/update",
  adminController.postEditUser,
);
adminRoutes.post(
  "/user/:userID/giveMoney",
  adminController.postGiveMoneyUser,
);

// adminRoutes.post(
//   "/:userID/delete",
//   passportConfig.isAuthenticated,
//   passportConfig.isAdmin,
//   adminController.postRemoveUser
// );
// applicationRoutes.post("/login", userController.postLoginApp)
// applicationRoutes.get("/ping", userController.getPing);
// applicationRoutes.get("/fromisbn", passportConfig.isAuthenticated, bookController.getFillBookData)
// applicationRoutes.get("/list", passportConfig.isAuthenticatedApp, bookController.getBooks)
// applicationRoutes.post("/sell", passportConfig.isAuthenticatedApp, passportConfig.isSeller, bookController.postSellBookApp)
// applicationRoutes.get("/find", passportConfig.isAuthenticatedApp, passportConfig.isSeller, bookController.getFindListingApp)
// applicationRoutes.post("/:itemID/sell", passportConfig.isAuthenticatedApp, passportConfig.isSeller, bookController.sellBookApp);

app.use("/admin", adminRoutes);

// app.get("/print", showPDF);
// app.get("/print/fetch", showPDF);

export default app;
