export { pl } from "./pl";
export { ukr } from "./ukr";
export { en } from "./en";

export interface Language {
  titles: {
    login: string;
    setup: string;
    signup: string;
    manage: string;
    forgotPassword: string;
  };
  success: {
    loggedIn: string;
    accountVerifyPrompt: string;
    passwordChanged: string;
    accountDeleted: string;
    accountVerified: string;
    passwordResetInfo: string;
  };
  errors: {
    validate: {
      emailInvalid: string;
      nameNotProvided: string;
      surnameNotProvided: string;
      passwordInvalid: string;
      passwordNotMatch: string;
      passwordBlank: string;
      tokenNotProvided: string;
      tokenInvalid: string;
      passwordTokenInvalid: string;
    };
    emailNotSent: string;
    accountAlreadyExists: string;
    accountCreationPermissionDenied: string;
    roleNotExisting: string;
    internal: string;
    accountDoesntExist: string;
  };
}
