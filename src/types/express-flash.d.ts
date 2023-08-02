/// <reference types="express" />


/**
 * This type definition augments existing definition
 * from @types/express-flash
 */
declare namespace Express {
    export interface Request {
        flashError(err: Error, msg: string | {msg: string}[], redirect?: boolean): any;
        flash(event: string, message: any): any;
    }
}

interface Flash {
    flash(type: string, message: any): void;
}

declare module "express-flash";

