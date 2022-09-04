import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import {showPDF} from "./util/generatePDF"
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";
import * as bookController from "./controllers/book"

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        mongoUrl,
        mongoOptions: {
            autoReconnect: true
        }
    })
}));
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
    // After successful login, redirect back to the intended page
    if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/adduser" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user &&
    req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
// app.get("/contact", contactController.getContact);
// app.post("/contact", contactController.postContact);
app.get("/",passportConfig.isAuthenticated, homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout",passportConfig.isAuthenticated, userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/adduser", userController.getSignup);
app.post("/adduser", userController.postSignup);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
// app.get("/api", apiController.getApi);
// app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
    res.redirect(req.session.returnTo || "/");
});

app.get("/find", passportConfig.isAuthenticated, passportConfig.isSeller, bookController.getFindListing)
app.get("/book/registry", passportConfig.isAuthenticated, bookController.getBookRegistry);
app.get("/book/list", passportConfig.isAuthenticated, bookController.getBooks);
app.get("/book/sell", passportConfig.isAuthenticated, bookController.getSellBook)
app.post("/book/sell", passportConfig.isAuthenticated, passportConfig.isSeller, bookController.postSellBook)
app.get("/book/fromisbn", passportConfig.isAuthenticated, bookController.getFillBookData)
app.get("/book/:itemID", passportConfig.isAuthenticated, bookController.editBook)
app.post("/book/:itemID/sell", passportConfig.isAuthenticated, passportConfig.isSeller, bookController.sellBook);


const applicationRoutes = express.Router()
applicationRoutes.post("/login", userController.postLoginApp)
applicationRoutes.get("/ping", userController.getPing);
applicationRoutes.get("/fromisbn", passportConfig.isAuthenticated, bookController.getFillBookData)
applicationRoutes.get("/list", passportConfig.isAuthenticatedApp, bookController.getBooks)
applicationRoutes.post("/sell", passportConfig.isAuthenticatedApp, passportConfig.isSeller, bookController.postSellBookApp)
applicationRoutes.get("/find", passportConfig.isAuthenticatedApp, passportConfig.isSeller, bookController.getFindListingApp)
applicationRoutes.post("/:itemID/sell", passportConfig.isAuthenticatedApp, passportConfig.isSeller, bookController.sellBookApp);
    
app.use("/app", applicationRoutes)

app.get("/showHTML", showPDF)
export default app;
