export { pl } from "./pl";
export { uk } from "./uk";
export { en } from "./en";
export { bad_pl } from "./bad_polish";
export { nya } from "./anime";
export { dbg } from "./dbg";

export interface Language {
  mail: {
    accountVerifyPrompt: {
      subject: string;
      text: string;
    };
    accountVerified: {
      subject: string;
      text: string;
    };
    passwordChanged: {
      subject: string;
      text: string;
    };
  };
  titles: {
    login: string;
    setup: string;
    signup: string;
    manage: string;
    forgotPassword: string;
    sellBook: string;
    printLabel: string;
    library: string;
    adminDashboard: string;
    resetPassword: string;
  };
  statuses: {
    registered: string;
    printed_label: string;
    accepted: string;
    sold: string;
    given_money: string;
    returned: string;
    canceled: string;
    deleted: string;
  };
  success: {
    schoolCreated: string;
    activationMailSent: string;
    listingSold: string;
    listingsSold: string;
    listingDeleted: string;
    listingCancelled: string;
    moneyGiven: string;
    listingAccepted: string;
    listingCreated: string;
    accountInfoUpdated: string;
    loggedIn: string;
    accountVerifyPrompt: string;
    accountVerified: string;
    passwordChanged: string;
    accountDeleted: string;
    passwordResetInfo: string;
  };
  info: {
    registrationDisabled: string;
  };
  errors: {
    permissionDenied: string;
    notLoggedIn: string;
    listingDoesntExist: string;
    listingCancelForbidden: string;
    roleNotExisting: string;
    internal: string;
    passwordResetTokenInvalid: string;
    accountCreationPermissionDenied: string;
    accountAlreadyExists: string;
    emailNotSent: string;
    accountDoesntExist: string;
    validate: {
      schoolNameBlank: string;
      schoolstreetBlank: string;
      schoolComissionMultiplierInvalid: string;
      isbnInvalid: string;
      phoneInvalid: string;
      bookTitleBlank: string;
      bookPublisherBlank: string;
      bookPublicationDateBlank: string;
      pageNotProvided: string;
      noPriceProvided: string;
      listingIdBlank: string;
      emailInvalid: string;
      nameNotProvided: string;
      surnameNotProvided: string;
      passwordBlank: string;
      passwordInvalid: string;
      passwordNotMatch: string;
      tokenNotProvided: string;
      tokenInvalid: string;
      passwordTokenInvalid: string;
    };
  };
  website: {
    title: string;
    signature: string;
    description: string;
    creator: string;
    empty: string;
    table: {
      headers: {
        print: string;
        title: string;
        publisher: string;
        price: string;
        printed: string;
        status: string;
        manage: string;
        ID: string;
        available: string;
        sold: string;
        role: string;
        averageTimeSpent: string;
        totalTimeSpent: string;
        name: string;
        surname: string;
        booksBought: string;
        moneySpent: string;
        profit: string;
        contact: string;
        costAvg: string;
        costMedian: string;
        earnings: string;
        books: string;
        debt: string;
        booksSold: string;
        booksAccepted: string;
        booksDeleted: string;
        paid: string;
        commission: string;
        school: string;
        user: string;
        edit: string;
      };
    };
    headers: {
      userList: string;
      staffList: string;
      books: string;
      sellBook: string;
      hello: string;
      addAccount: string;
      privacyPolicy: string;
      manage: string;
      forgotPassword: string;
      verifyAgain: string;
      login: string;
      manageProfile: string;
      resetPassword: string;
      statistics: string;
      timeSpent: string;
      buyers: string;
      bookDetails: string;
      users: string;
      giveMoney: string;
      profileInfo: string;
      school: string;
      menu: string;
      dashboard: string;
      earnings: string;
      book: string;
      cancelListing: string;
      cancel: string;
      acceptListing: string;
      deleteListing: string;
      listingRegistry: string;
    };
    button: {
      manage: string;
      addFirstBook: string;
      addNextBook: string;
      addBook: string;
      availableBooks: string;
      registry: string;
      registerBook: string;
      delete: string;
      accept: string;
      sell: string;
      logout: string;
      myAccount: string;
      addAccount: string;
      cancel: string;
      back: string;
      next: string;
      previous: string;
      labels: string;
      send: string;
      analitycs: string;
      resetPassword: string;
      forgotPassword: string;
      login: string;
      signup: string;
      register: string;
      resendPassword: string;
      updateProfile: string;
      privacyPolicy: string;
      changePassword: string;
      print: string;
      printLabel: string;
      forgotPasword: string;
      more: string;
      share: string;
      export: string;
      giveMoney: string;
      backMainPage: string;
      all: string;
      availableBook: string;
      home: string;
      addSchool: string;
      save: string;
    };
    input: {
      email: {
        placeholder: string;
        label: string;
      };
      password: {
        placeholder: string;
        label: string;
      };
      name: {
        placeholder: string;
        label: string;
      };
      surname: {
        placeholder: string;
        label: string;
      };
      phone: {
        placeholder: string;
        label: string;
      };
      confirmPassword: {
        placeholder: string;
        label: string;
      };
      isbn: {
        placeholder: string;
        label: string;
      };
      title: {
        placeholder: string;
        label: string;
      };
      publisher: {
        placeholder: string;
        label: string;
      };
      authors: {
        placeholder: string;
        label: string;
      };
      pubDate: {
        placeholder: string;
        label: string;
      };
      role: {
        placeholder: string;
        label: string;
      };
      school: {
        placeholder: string;
        label: string;
      };
      newPassword: {
        label: string;
        placeholder: string;
      };
      nameSurname: {
        label: string;
      };
      schoolName: {
        label: string;
        placeholder: string;
      };
      schoolFullName: {
        label: string;
        placeholder: string;
      };
      commissionMultiplier: {
        label: string;
        placeholder: string;
      };
      schoolLocalization: {
        label: string;
        placeholder: string;
      };
      schoolLogo: {
        label: string;
        placeholder: string;
      };
    };
    descriptions: {
      resetPasswordInstructions: string;
      AccountVerifyInstructions: string;
      createHeadAdmin: string;
      createTeamAccount: string;
      createUser: string;
      inputListingID: string;
      confirmAccept: string;
      confirmDelete: string;
      confirmCancel: string;
      sellListing: string;
      acceptListing: string;
      deleteListing: string;
      adminMainPage: string;
      searchListingID: string;
      addSchool: string;
    };
    acceptPrivacy: {
      nonhighlight: string;
      highlight: string;
    };
  };
}
