import type { Organization } from "@/payload-types";

export type TSignin = {
  email: string;
  password: string;
};

export type TResetPassword = {
  token: string;
  password: string;
};

export type TSignup = {
  name: string;
  email: string;
  password: string;
  organization: {
    name: string;
    type: Organization["type"];
  };
};
