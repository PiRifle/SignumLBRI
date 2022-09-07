import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import Mail from "nodemailer/lib/mailer";


let transporter: Mail;
nodemailer.createTestAccount().then((testAccount)=>{
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

/**
 * Contact form page.
 * @route GET /contact
 */
export const getContact = (req: Request, res: Response) => {
    res.render("contact", {
        title: "Contact"
    });
};

/**
 * Send a contact form via Nodemailer.
 * @route POST /contact
 */
export const postContact = async (req: Request, res: Response) => {
    await check("name", "Name cannot be blank").not().isEmpty().run(req);
    await check("email", "Email is not valid").isEmail().run(req);
    await check("message", "Message cannot be blank").not().isEmpty().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/contact");
    }

    const mailOptions = {
        to: "your@email.com",
        from: `${req.body.name} <${req.body.email}>`,
        subject: "Contact Form",
        text: req.body.message
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            req.flash("errors", { msg: err.message });
            return res.redirect("/contact");
        }
        req.flash("success", { msg: "Email has been sent successfully!" });
        res.redirect("/contact");
    });
};
