import { User, UserDocument } from "./models/User";
import { School, SchoolDocument } from "./models/School";
import { Book } from "./models/Book";
import { BookListing, BookListingDocument, Label } from "./models/BookListing";
import { generateBarcode, generateEAN13 } from "./util/barcode";
import { faker } from "@faker-js/faker";
import { WeightedItem, distributedRandomPick, randomPick } from "./utils";
import { calculateComission } from "./util/book";
import mongoose from "mongoose";
import { MONGODB_URI, SESSION_SECRET, version } from "./util/secrets";
import bluebird from "bluebird";
import validator from "validator";

const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

const schools: SchoolDocument[] = [...new Array(5).map(_ => null)];
const accounts: UserDocument[] = [...new Array(300).map(_ => null)];
const listings: BookListingDocument[] = [...new Array(2000).map(_ => null)];
const roleDistribution: WeightedItem<string>[] = [
    { item: "headadmin", weight: 1 },
    { item: "admin", weight: 7 },
    { item: "seller", weight: 20 },
    { item: "student", weight: 80 }
];

async function main() {

    for (let idx = 0; idx < schools.length; idx++) {
            console.log(`creating school ${idx}`);
            const school = new School({
                name: faker.company.name(),
                longName: faker.company.buzzPhrase(),
                street: faker.location.streetAddress(),
                icon: "data:image/webp;base64,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",
                markup: faker.number.float({ min: 0.1, max: 0.14 }),
                color: faker.color.rgb()
            });
            await school.save();
            schools[idx] = school;
            console.log(`created school ${idx}`);
        }
    // console.log(schools)

    for (let idx = 0; idx < accounts.length; idx++) {
        console.log(`creating account ${idx}`);
        const user = new User({
            profile: {
                name: faker.person.firstName(),
                surname: faker.person.lastName(),
                phone: faker.phone.number("#########")
            },
            role: distributedRandomPick(roleDistribution),
            school: randomPick(schools),
            password: "1234",
            email: validator.normalizeEmail(faker.internet.email(), {gmail_remove_dots: true}),
            createdAt: faker.date.past()
        });
        await user.save();
        accounts[idx] = user;
        console.log(`created account ${idx}`);
    }
    // console.log(accounts)

    const books = await Book.find({});

    for (let idx = 0; idx < listings.length; idx++) {
        console.log(`creating listing ${idx}`);
        const price = faker.number.int({ max: 9999, min: 100 }) / 10;
        const account = randomPick(accounts);
        const school = account!.school;
        const listing = new BookListing({
            book: randomPick(books),
            bookOwner: account,
            cost: price,
            commission: calculateComission(price, 2, school!.markup),
            createdAt: faker.date.past(),
            school: school
        });
        const label = new Label({
            barcode: generateBarcode(listing._id),
            sold: false,
        });
        listing.label = label;
        await listing.save();
        await label.save();
        console.log(`created listing ${idx}`);

    }

}

console.log(mongoUrl);

mongoose
    .connect(mongoUrl, {})
    .then(main)
    .catch((err) => {
        console.log(
            `MongoDB connection error. Please make sure MongoDB is running. ${err}`,
        );
    });