import { Request, Response } from "express";
import { BookListing } from "../models/BookListing";
import { UserDocument } from "../models/User";

/**
 * Home page.
 * @route GET /
 */
// export const index = (req: Request, res: Response) => {
//     res.render("home", {
//         title: "Home"
//     });
// };
export const index = async (req: Request, res: Response): Promise<void> => {
    if ((req.user as UserDocument).role !="student"){
        res.render("homeStaff", {
          title: "Home",
        });
    }else{
        const bookListings = await BookListing.find({bookOwner: req.user}).populate("book", "-image").catch((err: Error)=>{
            req.flash("errors", { msg: JSON.stringify(err) });
            return res.redirect("/");
        });
        res.render("home", {
            title: "Home",
            bookListings: bookListings ? (bookListings.length > 0 ? bookListings : undefined) : undefined,
          });

    }
};
