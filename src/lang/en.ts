import { Language } from ".";

export const en = {
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
  },
  success: {
    loggedIn: "Success! You are logged in.",
    accountVerifyPrompt:
      "Your Account has been created, Verify your account by clicking the url sent to your mail",
    accountVerified: "Your account has been successfully verified",
    passwordChanged: "Password has been changed.",
    accountDeleted: "Your Account has been successfully deleted!",
    passwordResetInfo:
      "We sent you instructions how to reset your password to your mail address",
  },
  errors: {
    roleNotExisting: "This role does not exist",
    internal: "An internal error has occured, try again later",
    accountCreationPermissionDenied:
      "You have no permission to create new privileged users",
    accountAlreadyExists: "Account with this address already exists",
    emailNotSent:
      "There was a problem sending your mail.. Try contacting our administration team to resolve this issue",
    accountDoesntExist: "Account associated with this e-mail does not exist",
    validate: {
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
} as Language;
