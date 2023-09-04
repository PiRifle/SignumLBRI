import { Language } from ".";

export const lang = {
  mail: {
    accountVerifyPrompt: {
      subject: "Account Confirmation",
      text: "Your account has been created. Verify your account by clicking on the link sent below."
    },
    accountVerified: {
      subject: "Account Verified",
      text: "Your account has been successfully verified."
    },
    passwordChanged: {
      subject: "Password Changed",
      text: "Password has been changed."
    }
  },
  titles: {
    login: "Login",
    setup: "Setup",
    signup: "Sign Up",
    manage: "Manage Account",
    forgotPassword: "Forgot Password",
    sellBook: "Sell Book",
    printLabel: "Print Label",
    library: "Library",
    adminDashboard: "Admin Dashboard",
    resetPassword: "Reset Password"
  },
  statuses: {
    registered: "Book Registered",
    printed_label: "Label for Book Printed",
    accepted: "Book Accepted by Seller",
    sold: "Book Sold",
    given_money: "Money Sent",
    canceled: "Listing Canceled",
    deleted: "Listing Deleted",
  },
  success: {
    schoolCreated: "School Created Successfully",
    activationMailSent: "Activation email sent to your email address",
    listingSold: "Book sold!",
    listingsSold: "Books sold!",
    listingDeleted: "Book deleted!",
    listingCancelled: "Book canceled!",
    moneyGiven: "Money sent",
    listingAccepted: "Book accepted successfully!",
    listingCreated: "Listing created successfully",
    accountInfoUpdated: "Profile information has been updated.",

    loggedIn: "Success! Logged in.",
    accountVerifyPrompt:
      "Your account has been created. Verify your account by clicking on the link sent to your email address.",
    accountVerified: "Your account has been successfully verified",
    passwordChanged: "Password has been changed.",
    accountDeleted: "Your account has been successfully deleted!",
    passwordResetInfo:
      "We've sent you instructions for resetting your password to your email address",
  },
  info: {
    registrationDisabled: "Registration is currently disabled",
  },
  errors: {
    permissionDenied: "Permission Denied",
    notLoggedIn: "You are not logged in",
    listingDoesntExist: "Listing doesn't exist",
    listingCancelForbidden: "Listing cannot be canceled",
    roleNotExisting: "This role does not exist",
    internal: "Internal error occurred, please try again later",
    passwordResetTokenInvalid: "Password reset token is invalid or expired.",
    accountCreationPermissionDenied: "You don't have permission to create new privileged users",
    accountAlreadyExists: "An account with this email address already exists",
    emailNotSent: "There was a problem sending the email. Please contact our admin team to resolve this issue",
    accountDoesntExist: "An account associated with this email address does not exist",
    validate: {
      schoolNameBlank: "Please provide a school name",
      schoolstreetBlank: "Please provide a school street",
      schoolComissionMultiplierInvalid: "Please provide a valid commission multiplier",
      isbnInvalid: "Invalid ISBN code provided",
      phoneInvalid: "Invalid phone number provided",
      bookTitleBlank: "Book title cannot be empty",
      bookPublisherBlank: "Book publisher cannot be empty",
      bookPublicationDateBlank: "Book publication date cannot be empty",
      pageNotProvided: "Page not provided",
      noPriceProvided: "Please provide a price",
      listingIdBlank: "Listing ID not provided",
      emailInvalid: "Please provide a valid email address.",
      nameNotProvided: "Name not provided",
      surnameNotProvided: "Surname not provided",
      passwordBlank: "Password cannot be empty",
      passwordInvalid: "Password must be at least 4 characters",
      passwordNotMatch: "Passwords do not match",
      tokenNotProvided: "Token not provided",
      tokenInvalid: "Account token is invalid or expired.",
      passwordTokenInvalid: "Account token is invalid or expired."
    }
  },
  website: {
    title: "Book Fair",
    signature: "easier!",
    description: "\"Sell, give away, earn!\" That's our message. Your school textbooks gain a second life through a fast and convenient selling and buying process on our platform.",
    creator: "- Creator of Blind Dating 2",
    empty: "A little empty here...",
    table: {
      headers: {
        print: "Print",
        title: "Title",
        publisher: "Publisher",
        price: "Price",
        printed: "Printed",
        status: "Status",
        manage: "Manage",
        ID: "ID",
        available: "Available",
        sold: "Sold",
        role: "Role",
        averageTimeSpent: "Average Time Spent",
        totalTimeSpent: "Total Time Spent",
        name: "Name",
        surname: "Surname",
        booksBought: "Books Bought",
        moneySpent: "Money Spent",
        profit: "Profit",
        contact: "Contact",
        costAvg: "Average Cost",
        costMedian: "Median Cost",
        earnings: "Earnings",
        books: "Books",
        debt: "Debt",
        booksSold: "Books Sold",
        booksAccepted: "Books Accepted",
        booksDeleted: "Books Deleted",
        paid: "Paid",
        commission: "Commission",
        school: "School",
        user: "User",
        edit: "Edit"
      }
    },
    headers: {
      userList: "User List",
      staffList: "Staff List",
      books: "Your Books",
      sellBook: "Sell Book",
      hello: "Hello",
      addAccount: "Add Account",
      privacyPolicy: "Privacy Policy",
      manage: "Manage Labels",
      forgotPassword: "Forgot Password",
      verifyAgain: "Verify Again",
      login: "Login",
      manageProfile: "Manage Profile",
      resetPassword: "Reset Password",
      statistics: "Statistics",
      timeSpent: "Time Spent",
      buyers: "Buyers",
      bookDetails: "Book Details",
      users: "Users",
      giveMoney: "Give Money",
      profileInfo: "Profile Information",
      school: "School",
      menu: "Menu",
      dashboard: "Dashboard",
      earnings: "Earnings",
      book: "Book",
      cancelListing: "Cancel Listing",
      cancel: "Cancel",
      acceptListing: "Accept Listing",
      deleteListing: "Delete Listing",
      listingRegistry: "Listing Registry"
    },
    button: {
      manage: "Manage",
      addFirstBook: "Add First Book",
      addNextBook: "Add Next Book",
      addBook: "Add Book",
      availableBooks: "Available Books",
      registry: "Listing Registry",
      registerBook: "Register Book",
      delete: "Delete",
      accept: "Accept",
      sell: "Sell",
      logout: "Logout",
      myAccount: "My Account",
      addAccount: "Add Account",
      cancel: "Cancel",
      back: "Back",
      next: "Next",
      previous: "Previous",
      labels: "Labels",
      send: "Send",
      analitycs: "Analytics",
      resetPassword: "Reset Password",
      forgotPassword: "Forgot Password?",
      login: "Login",
      signup: "Sign Up",
      register: "Register",
      resendPassword: "Resend Verification Email",
      updateProfile: "Update Profile",
      privacyPolicy: "Privacy Policy",
      changePassword: "Change Password",
      print: "Print",
      printLabel: "Print Label",
      forgotPasword: "Forgot Password?",
      more: "More",
      share: "Share",
      export: "Export",
      giveMoney: "Give Money",
      backMainPage: "Back to Main Page",
      all: "All",
      availableBook: "Available Books",
      home: "Home",
      addSchool: "Add School",
      save: "Save"
    },
    input: {
      email: { placeholder: "Enter your email address", label: "Email" },
      password: { placeholder: "Enter a secure password", label: "Password" },
      name: { placeholder: "Enter your name", label: "Name" },
      surname: { placeholder: "Enter your surname", label: "Surname" },
      phone: { placeholder: "Enter your phone number", label: "Phone Number" },
      confirmPassword: { placeholder: "Confirm your password", label: "Confirm Password" },
      isbn: { placeholder: "Enter the Barcode from the Back of the Book", label: "ISBN" },
      title: { placeholder: "Enter the book title", label: "Title" },
      publisher: { placeholder: "Enter the publisher's name", label: "Publisher" },
      authors: { placeholder: "Enter author/authors, separated by commas", label: "Authors" },
      pubDate: { placeholder: "Enter publication year (YYYY)", label: "Publication Year" },
      role: { placeholder: "Enter your role or position", label: "Role" },
      school: { placeholder: "Enter the school name", label: "School" },
      newPassword: {
        label: "New Password",
        placeholder: "Enter a new password"
      },
      nameSurname: {
        label: "Name and Surname"
      },
      schoolName: {
        label: "School Name",
        placeholder: "Enter the school name"
      },
      schoolFullName: {
        label: "Full School Name",
        placeholder: "Enter the full school name"
      },
      commissionMultiplier: {
        label: "Commission Multiplier",
        placeholder: "Enter the commission multiplier"
      },
      schoolLocalization: {
        label: "School Location",
        placeholder: "Enter the school location"
      },
      schoolLogo: {
        label: "School Logo",
        placeholder: "Enter the school logo link"
      }
    },
    descriptions: {
      resetPasswordInstructions: "Enter your email address to receive password reset instructions.",
      AccountVerifyInstructions: "Check your inbox and click the link in the email to verify your account.",
      createHeadAdmin: "Create a head administrator for a new school.",
      createTeamAccount: "Add a new account to the team.",
      createUser: "Create a new user.",
      inputListingID: "Enter Listing ID.",
      confirmAccept: "Confirm acceptance of this operation.",
      confirmDelete: "Confirm deletion of this operation.",
      confirmCancel: "Confirm cancellation of this operation.",
      sellListing: "Add a book to the selling list.",
      acceptListing: "Accept a book selling listing.",
      deleteListing: "Delete a book selling listing.",
      adminMainPage: "Go to the main page of the admin panel.",
      searchListingID: "Enter Listing ID",
      addSchool: "Add a new school."
    },
    acceptPrivacy: {
      nonhighlight: "I accept",
      highlight: "Privacy Policy"
    }
  },
};

export const en = lang as Language;
