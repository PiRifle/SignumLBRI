import {Request, Response} from "express";

export function main(req: Request, res: Response): void{
    res.render("admin/layout");
}