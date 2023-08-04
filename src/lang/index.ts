export { pl } from "./pl";
export { ukr } from "./ukr";
export { en } from "./en";
import { lang } from "./en";

export type Language = typeof lang

// export interface Language {
//   titles: {
//     login: string;
//     setup: string;
//     signup: string;
//     manage: string;
//     forgotPassword: string;
//     sellBook: string;
//     printLabel: string;
//     library: string;    
//   };
//   success: {
//     listingSold: string;
//     listingsSold: string;
//     listingDeleted: string;
//     listingCancelled: string;
//     moneyGiven: string;
//     listingAccepted: string;
//     listingCreated: string;
//     loggedIn: string;
//     accountVerifyPrompt: string;
//     passwordChanged: string;
//     accountDeleted: string;
//     accountVerified: string;
//     passwordResetInfo: string;
//     accountInfoUpdated: string;
//   };
//   statuses: {
//     registered: string;
//     printed_label: string;
//     accepted: string;
//     sold: string;
//     given_money: string;
//     canceled: string;
//     deleted: string;
//   },
//   errors: {
//     listingDoesntExist: string;
//     notLoggedIn: string;
//     listingCancelForbidden: string;
//     validate: {
//       emailInvalid: string;
//       nameNotProvided: string;
//       surnameNotProvided: string;
//       passwordInvalid: string;
//       passwordNotMatch: string;
//       passwordBlank: string;
//       tokenNotProvided: string;
//       tokenInvalid: string;
//       passwordTokenInvalid: string;
//       isbnInvalid: string;
//       phoneInvalid: string;
//       pageNotProvided: string;
//       bookTitleBlank: string;
//       bookPublisherBlank: string;
//       bookPublicationDateBlank: string;
//       noPriceProvided: string;
//       listingIdBlank: string;
//       schoolNameBlank: string;  
//       schoolstreetBlank: string;  
//       schoolComissionMultiplierInvalid: string; 
//     };
//     emailNotSent: string;
//     accountAlreadyExists: string;
//     accountCreationPermissionDenied: string;
//     roleNotExisting: string;
//     internal: string;
//     accountDoesntExist: string;
//   };
// }
