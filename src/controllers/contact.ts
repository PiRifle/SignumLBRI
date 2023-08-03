import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import {
  MAIL_PASSWORD,
  MAIL_USER,
  MAIL_HOST,
  MAIL_SHOWMAIL,
} from "../util/secrets";

// nodemailer.createTestAccount().then((testAccount)=>{
const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: MAIL_USER, // generated ethereal user
    pass: MAIL_PASSWORD, // generated ethereal password
  },
  // });
});

/**
 * Contact form page.
 * @route GET /contact
 */
export const getContact = (_req: Request, res: Response): void => {
  res.render("contact", {
    title: "Contact",
  });
};

/**
 * Send a contact form via Nodemailer.
 * @route POST /contact
 */
export const postContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await check("name", "Name cannot be blank").not().isEmpty().run(req);
  await check("email", "Email is not valid").isEmail().run(req);
  await check("message", "Message cannot be blank").not().isEmpty().run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("errors", errors.array());
    return res.redirect("/contact");
  }

  const mailOptions = {
    to: MAIL_SHOWMAIL,
    from: `${req.body.name} <${req.body.email}>`,
    subject: "Contact Form",
    text: req.body.message,
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
