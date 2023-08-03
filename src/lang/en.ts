import { Language } from ".";

export const lang = {
  mail: {
    accountVerifyPrompt: {
      subject: "",
      text: "",
    },
    accountVerified: {
      subject: "",
      text: "",
    },
    passwordChanged: {
      subject: "",
      text: "",
    },
  },
  titles: {
    login: "Login",
    setup: "Set Up",
    signup: "Create Account",
    manage: "Account Management",
    forgotPassword: "Forgot Password",
    sellBook: "Sell Book",
    printLabel: "Print Label",
    library: "Library",
    adminDashboard: "Dashboard",
    resetPassword: "Password Reset"
  },
  statuses: {
    registered: "Book Registered",
    printed_label: "Label for book printed",
    accepted: "Book Accepted by seller",
    sold: "Book Sold",
    given_money: "Money Sent",
    canceled: "Listing Cancelled",
    deleted: "Listing Deleted",
  },
  success: {
    schoolCreated: "Successfully created School",
    activationMailSent: "Your activation mail has been sent",
    listingSold:"Book Sold!",
    listingsSold:"Books Sold!",
    listingDeleted: "Book Deleted!",
    listingCancelled: "Book Cancelled!",
    moneyGiven: "Money given",
    listingAccepted: "Book Accepted Successfully!",
    listingCreated: "Listing Created Successfully",
    accountInfoUpdated: "Profile information has been updated.",

    loggedIn: "Success! You are logged in.",
    accountVerifyPrompt:
      "Your Account has been created, Verify your account by clicking the url sent to your mail",
    accountVerified: "Your account has been successfully verified",
    passwordChanged: "Password has been changed.",
    accountDeleted: "Your Account has been successfully deleted!",
    passwordResetInfo:
      "We sent you instructions how to reset your password to your mail address",
  },
  info: {
    registrationDisabled: "The registration is currently disabled",
  },
  errors: {
    permissionDenied: "Permission Denied",
    notLoggedIn: "You Are not logged in",
    listingDoesntExist: "Listing does not exist",
    listingCancelForbidden: "Cannot cancel listing",
    roleNotExisting: "This role does not exist",
    internal: "An internal error has occured, try again later",
    passwordResetTokenInvalid: "Password reset token is invalid or has expired.",
    accountCreationPermissionDenied:
      "You have no permission to create new privileged users",
    accountAlreadyExists: "Account with this address already exists",
    emailNotSent:
      "There was a problem sending your mail.. Try contacting our administration team to resolve this issue",
    accountDoesntExist: "Account associated with this e-mail does not exist",
    validate: {
      schoolNameBlank: "Please provide School name",
      schoolstreetBlank: "Please provide School name",
      schoolComissionMultiplierInvalid: "Please provide correct markup muiltiplier",

      isbnInvalid: "Invalid ISBN code provided",
      phoneInvalid: "Invalid Phone number provided",
      bookTitleBlank: "Book Title cannot be blank",
      bookPublisherBlank: "Book Publisher cannot be blank",
      bookPublicationDateBlank: "Book publication date cannot be blank",
      pageNotProvided: "Page not provided",
      noPriceProvided: "Please provide a price",
      listingIdBlank: "No book listing id provided",
      emailInvalid: "Please enter a valid email address.",
      nameNotProvided: "Name not provided",
      surnameNotProvided: "Surname not provided",
      passwordBlank: "Password cannot be blank",
      passwordInvalid: "Password must be at least 4 characters long",
      passwordNotMatch: "Passwords do not match",
      tokenNotProvided: "No authorization token provided",
      tokenInvalid: "Account token is invalid or has expired.",
      passwordTokenInvalid: "Account token is invalid or has expired.",
    },
  },
  website:{

  }
}; 

export const en = lang as Language;
