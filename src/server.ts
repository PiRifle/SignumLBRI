import errorHandler from "errorhandler";
import app from "./app";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

/**
 * Error Handler. Provides full stack
 */
let transporter: Mail;
if (process.env.NODE_ENV === "development") {
    app.use(errorHandler());
    
    nodemailer.createTestAccount().then((testAccount) => {
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    });

}else{
//  transporter = nodemailer.createTransport({
//    host: "smtp.ethereal.email",
//    port: 587,
//    secure: false, // true for 465, false for other ports
//    auth: {
//      user: testAccount.user, // generated ethereal user
//      pass: testAccount.pass, // generated ethereal password
//    },
//  });
}

// console.log()
// fetchBook(9788326227981).then(result=>console.log(result))
/**
 * Start Express server.
 */


const server = app.listen(app.get("port"), () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});

export default server;
