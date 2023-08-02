import {SchoolDocument} from "./School";
import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";

export type UserDocument = mongoose.Document & {
    email: string;
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;

    accountVerifyToken: string;
    
    facebook: string;
    tokens: AuthToken[];
    
    school: SchoolDocument;
    role: string;

    profile: {
        name: string;
        surname: string;
        phone: string;
        gender: string;
        location: string;
        website: string;
        picture: string;
        
    };

    comparePassword: comparePasswordFunction;
    gravatar: (size: number) => string;
    isSeller: () => boolean;
    isAdmin: () => boolean;
    isHeadAdmin: () => boolean;

    softDelete: boolean
    realAddress: string
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: Error, isMatch: boolean) => void) => void;

export interface AuthToken {
    accessToken: string;
    kind: string;
}

const userSchema = new mongoose.Schema<UserDocument>(
    {
        email: { type: String, unique: true },
        password: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
    
        accountVerifyToken: String,
        
        role: String,
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
        },

        profile: {
            name: String,
            surname: String,
            phone: String,
            gender: String,
            location: String,
            website: String,
            picture: String
        },

        softDelete: Boolean,
        realAddress: String
    },
    { timestamps: true },
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
    const user = this as UserDocument;
    if (!user.isModified("password")) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
        cb(err, isMatch);
    });
};

userSchema.methods.comparePassword = comparePassword;

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (size: number = 200) {
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};


userSchema.methods.isSeller = function () {
    return ["seller", "admin", "headadmin"].includes(this.role as string);
};

userSchema.methods.isAdmin = function () {
    return ["admin", "headadmin"].includes(this.role as string);
};

userSchema.methods.isHeadAdmin = function () {
    return ["headadmin"].includes(this.role as string);
};

export const User = mongoose.model<UserDocument>("User", userSchema);
