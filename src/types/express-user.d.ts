/// <reference types="express" />
import { UserDocument } from "../models/User";

declare global {
        namespace Express {
    export interface User extends UserDocument {}
    }
}
