export const APP_TITLE = "FONDEF 10337";
// export const DATABASE_PREFIX = "acme_v3";
// export const EMAIL_SENDER = '"Acme" <noreply@acme.com>';

export const redirects = {
  toLogin: "/login",
  toSignup: "/signup",
  afterLogin: "/studies-list",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/dashboard",
} as const;
