/// <reference types="express" />
// import { UserDocument } from "../models/User";
import {Language} from "../lang"

declare global {
    namespace Express {
        interface Request {
            language: Language
        }
    }
}
