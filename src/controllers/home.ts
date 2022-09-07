import e, { Request, Response } from "express";
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
export const index = (req: Request, res: Response) => {
    if ((req.user as UserDocument).role !="student"){
        res.render("homeStaff", {
            title: "Home",
        });
    }else{
        res.render("home", {
            title: "Home",
          });

    }
};
