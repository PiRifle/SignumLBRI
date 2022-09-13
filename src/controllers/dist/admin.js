"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.apiUsers = exports.apiBooks = exports.books = exports.buyers = exports.users = exports.main = void 0;
var User_1 = require("../models/User");
var BookListing_1 = require("../models/BookListing");
var express_validator_1 = require("express-validator");
var moment_1 = require("moment");
var Book_1 = require("../models/Book");
var math_1 = require("../util/math");
function main(req, res) {
    res.render("admin/page/dashboard", { title: "Dashboard" });
}
exports.main = main;
function users(req, res) {
    res.render("admin/page/users", { title: "Users" });
}
exports.users = users;
function buyers(req, res) {
    res.render("admin/page/dashboard", { title: "Buyers" });
}
exports.buyers = buyers;
function books(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Book_1.Book.aggregate([
                        {
                            $lookup: {
                                from: "booklistings",
                                localField: "_id",
                                foreignField: "book",
                                as: "listings"
                            }
                        },
                        {
                            $lookup: {
                                from: "booklistings",
                                localField: "_id",
                                foreignField: "book",
                                as: "listings"
                            }
                        },
                        {
                            $addFields: {
                                available: {
                                    $size: {
                                        $filter: {
                                            input: "$listings",
                                            as: "available",
                                            cond: {
                                                $eq: ["$$available.status", "accepted"]
                                            }
                                        }
                                    }
                                },
                                sold: {
                                    $size: {
                                        $filter: {
                                            input: "$listings",
                                            as: "available",
                                            cond: {
                                                $eq: ["$$available.status", "sold"]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $unwind: "$listings"
                        },
                        {
                            $match: {
                                $nor: [
                                    {
                                        "listings.status": "canceled"
                                    },
                                    {
                                        "listings.status": "deleted"
                                    },
                                ]
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                avgCost: {
                                    $avg: "$listings.cost"
                                },
                                sold: {
                                    $first: "$sold"
                                },
                                available: {
                                    $first: "$available"
                                },
                                title: {
                                    $first: "$title"
                                },
                                publisher: {
                                    $first: "$publisher"
                                },
                                costTable: {
                                    $addToSet: "$listings.cost"
                                }
                            }
                        },
                        {
                            $sort: {
                                sold: -1
                            }
                        },
                    ])];
                case 1:
                    result = _a.sent();
                    result.forEach(function (value) {
                        value.median = math_1.median(value.costTable);
                    });
                    res.render("admin/page/books", { title: "Books", data: result });
                    return [2 /*return*/];
            }
        });
    });
}
exports.books = books;
function apiBooks(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, _a, from, to, exact;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, express_validator_1.check("from", "no from date provided").exists().run(req)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, express_validator_1.check("to", "no to date provided").exists().run(req)];
                case 2:
                    _b.sent();
                    errors = express_validator_1.validationResult(req);
                    if (!errors.isEmpty()) {
                        return [2 /*return*/, res.status(400).end()];
                    }
                    _a = req.query, from = _a.from, to = _a.to, exact = _a.exact;
                    BookListing_1.BookListing.aggregate([
                        {
                            $addFields: {
                                fromDate: new Date(from),
                                toDate: new Date(to)
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $gt: ["$createdAt", "$fromDate"]
                                                },
                                                {
                                                    $lt: ["$createdAt", "$toDate"]
                                                },
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $gt: ["$whenPrinted", "$fromDate"]
                                                },
                                                {
                                                    $lt: ["$whenPrinted", "$toDate"]
                                                },
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $gt: ["$whenVerified", "$fromDate"]
                                                },
                                                {
                                                    $lt: ["$whenVerified", "$toDate"]
                                                },
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $gt: ["$whenSold", "$fromDate"]
                                                },
                                                {
                                                    $lt: ["$whenSold", "$toDate"]
                                                },
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $gt: ["$whenGivenMoney", "$fromDate"]
                                                },
                                                {
                                                    $lt: ["$whenGivenMoney", "$toDate"]
                                                },
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $gt: ["$whenCanceled", "$fromDate"]
                                                },
                                                {
                                                    $lt: ["$whenCanceled", "$toDate"]
                                                },
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $gt: ["$whenDeleted", "$fromDate"]
                                                },
                                                {
                                                    $lt: ["$whenDeleted", "$toDate"]
                                                },
                                            ]
                                        },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                dates: [
                                    {
                                        type: "created",
                                        date: "$createdAt"
                                    },
                                    {
                                        type: "printed_label",
                                        date: "$whenPrinted"
                                    },
                                    {
                                        type: "accepted",
                                        date: "$whenVerified"
                                    },
                                    {
                                        type: "sold",
                                        date: "$whenSold"
                                    },
                                    {
                                        type: "given_money",
                                        date: "$whenGivenMoney"
                                    },
                                    {
                                        type: "canceled",
                                        date: "$whenCanceled"
                                    },
                                    {
                                        type: "deleted",
                                        date: "$whenDeleted"
                                    },
                                ]
                            }
                        },
                        {
                            $unwind: "$dates"
                        },
                        {
                            $group: {
                                _id: exact
                                    ? {
                                        year: {
                                            $year: "$dates.date"
                                        },
                                        month: {
                                            $month: "$dates.date"
                                        },
                                        day: {
                                            $dayOfMonth: "$dates.date"
                                        },
                                        hour: {
                                            $hour: "$dates.date"
                                        },
                                        minute: {
                                            $minute: "$dates.date"
                                        }
                                    }
                                    : {
                                        year: {
                                            $year: "$dates.date"
                                        },
                                        month: {
                                            $month: "$dates.date"
                                        },
                                        day: {
                                            $dayOfMonth: "$dates.date"
                                        }
                                    },
                                created: {
                                    $sum: {
                                        $cond: {
                                            "if": {
                                                $eq: ["$dates.type", "created"]
                                            },
                                            then: 1,
                                            "else": 0
                                        }
                                    }
                                },
                                printed_label: {
                                    $sum: {
                                        $cond: {
                                            "if": {
                                                $eq: ["$dates.type", "printed_label"]
                                            },
                                            then: 1,
                                            "else": 0
                                        }
                                    }
                                },
                                accepted: {
                                    $sum: {
                                        $cond: {
                                            "if": {
                                                $eq: ["$dates.type", "accepted"]
                                            },
                                            then: 1,
                                            "else": 0
                                        }
                                    }
                                },
                                sold: {
                                    $sum: {
                                        $cond: {
                                            "if": {
                                                $eq: ["$dates.type", "sold"]
                                            },
                                            then: 1,
                                            "else": 0
                                        }
                                    }
                                },
                                given_money: {
                                    $sum: {
                                        $cond: {
                                            "if": {
                                                $eq: ["$dates.type", "given_money"]
                                            },
                                            then: 1,
                                            "else": 0
                                        }
                                    }
                                },
                                canceled: {
                                    $sum: {
                                        $cond: {
                                            "if": {
                                                $eq: ["$dates.type", "canceled"]
                                            },
                                            then: 1,
                                            "else": 0
                                        }
                                    }
                                },
                                deleted: {
                                    $sum: {
                                        $cond: {
                                            "if": {
                                                $eq: ["$dates.type", "deleted"]
                                            },
                                            then: 1,
                                            "else": 0
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $addFields: {
                                date: {
                                    $dateFromParts: {
                                        year: "$_id.year",
                                        month: "$_id.month",
                                        day: "$_id.day"
                                    }
                                }
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $ne: ["$date", null]
                                }
                            }
                        },
                    ]).exec(function (err, userStatistics) {
                        if (err) {
                            return res.status(500).end();
                        }
                        console.log(userStatistics);
                        var dataset = [];
                        dataset.push({
                            label: "Books Created",
                            data: userStatistics.map(function (val) {
                                if (val.date) {
                                    return {
                                        x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                        y: val.created
                                    };
                                }
                            }),
                            borderColor: "green",
                            fill: true
                        });
                        dataset.push({
                            label: "Labels Printed",
                            data: userStatistics.map(function (val) {
                                return val.date
                                    ? {
                                        x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                        y: val.printed_label
                                    }
                                    : undefined;
                            }),
                            borderColor: "blue",
                            fill: true
                        });
                        dataset.push({
                            label: "Books Accepted",
                            data: userStatistics.map(function (val) {
                                return val.date
                                    ? {
                                        x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                        y: val.accepted
                                    }
                                    : undefined;
                            }),
                            borderColor: "yellow",
                            fill: true
                        });
                        dataset.push({
                            label: "Books Sold",
                            data: userStatistics.map(function (val) {
                                return val.date
                                    ? {
                                        x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                        y: val.sold
                                    }
                                    : undefined;
                            }),
                            borderColor: "white",
                            fill: true
                        });
                        dataset.push({
                            label: "Money Given",
                            data: userStatistics.map(function (val) {
                                return val.date
                                    ? {
                                        x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                        y: val.given_money
                                    }
                                    : undefined;
                            }),
                            borderColor: "orange",
                            fill: true
                        });
                        dataset.push({
                            label: "Books Canceled",
                            data: userStatistics.map(function (val) {
                                return val.date
                                    ? {
                                        x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                        y: val.canceled
                                    }
                                    : undefined;
                            }),
                            borderColor: "red",
                            fill: true
                        });
                        dataset.push({
                            label: "Books Deleted",
                            data: userStatistics.map(function (val) {
                                return val.date
                                    ? {
                                        x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                        y: val.deleted
                                    }
                                    : undefined;
                            }),
                            borderColor: "purple",
                            fill: true
                        });
                        return res.json(dataset).end();
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.apiBooks = apiBooks;
function apiUsers(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, _a, from, to, exact;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, express_validator_1.check("from", "no from date provided").exists().run(req)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, express_validator_1.check("to", "no to date provided").exists().run(req)];
                case 2:
                    _b.sent();
                    errors = express_validator_1.validationResult(req);
                    if (!errors.isEmpty()) {
                        return [2 /*return*/, res.status(400).end()];
                    }
                    _a = req.query, from = _a.from, to = _a.to, exact = _a.exact;
                    User_1.User.aggregate([
                        {
                            $addFields: {
                                fromDate: new Date(from),
                                toDate: new Date(to)
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $gt: ["$createdAt", "$fromDate"] },
                                                { $lt: ["$createdAt", "$toDate"] },
                                            ]
                                        },
                                    ]
                                }
                            }
                        },
                        exact
                            ? {
                                $group: {
                                    _id: {
                                        hour: {
                                            $hour: "$createdAt"
                                        },
                                        minute: {
                                            $minute: "$createdAt"
                                        },
                                        month: {
                                            $month: "$createdAt"
                                        },
                                        day: {
                                            $dayOfMonth: "$createdAt"
                                        },
                                        year: {
                                            $year: "$createdAt"
                                        }
                                    },
                                    count: {
                                        $sum: 1
                                    }
                                }
                            }
                            : {
                                $group: {
                                    _id: {
                                        month: {
                                            $month: "$createdAt"
                                        },
                                        day: {
                                            $dayOfMonth: "$createdAt"
                                        },
                                        year: {
                                            $year: "$createdAt"
                                        }
                                    },
                                    count: {
                                        $sum: 1
                                    }
                                }
                            },
                        {
                            $addFields: {
                                date: {
                                    $dateFromParts: {
                                        year: "$_id.year",
                                        month: "$_id.month",
                                        day: "$_id.day"
                                    }
                                }
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $ne: ["$date", null]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: false
                            }
                        },
                    ]).exec(function (err, userStatistics) {
                        if (err) {
                            return res.status(500).end();
                        }
                        console.log(userStatistics);
                        var dataset = [];
                        dataset.push({
                            label: "Registered Users",
                            data: userStatistics.map(function (val) {
                                return {
                                    x: moment_1["default"](new Date(val.date)).format("DD/MM/YYYY"),
                                    y: val.count
                                };
                            }),
                            borderColor: "green",
                            fill: false
                        });
                        return res.json(dataset).end();
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.apiUsers = apiUsers;
