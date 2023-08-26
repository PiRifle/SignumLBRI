import {Request, Response} from "express";
import { Error } from "../models/Error";
import {deserializeError} from "serialize-error";

export const postError = async (req: Request, res: Response) => {

    if (!req.user) return res.sendStatus(401);
    // const error = deserializeError();
    // console.log(error)
    const err = new Error(req.body);
    err.user = req.user;
    await err.save();

};