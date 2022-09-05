import errorHandler from "errorhandler";
import app from "./app";
const dnssd = require("dnssd");
/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
    app.use(errorHandler());
}

// console.log()
// fetchBook(9788326227981).then(result=>console.log(result))
/**
 * Start Express server.
 */


const ad = new dnssd.Advertisement(dnssd.tcp("http"), Number(app.get("port")), {
    name: "SignumLBRI-server",
});

const server = app.listen(app.get("port"), () => {
    ad.start();
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});

export default server;
