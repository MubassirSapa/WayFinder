export const CHECK_EMAIL_CLIENT = {
  TITLE: "Check Your Inbox",
  DESC: "We've sent a verification link to your email. Click the link to secure your account and continue your setup. If you don't see it, please check your Spam or Promotions folders.",
  OTHER_DEVICE_DESC: "Verified on another device? You can sign in here once verification is complete.",
  SIGNIN_CTA: "Sign In",
  TIMER: (seconds: number) => `Sign-in option available in ${seconds} seconds`,

  BACK_HOME_CTA: "Back to Home",
} as const;
