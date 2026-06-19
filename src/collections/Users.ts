import type { CollectionConfig } from "payload";
import { createElement } from "react";
import { render } from "react-email";

import { BRAND } from "@/constants/brand";
import { ResetPasswordEmailTemplate } from "@/features/email/templates/ResetPasswordEmail";
import { VerifyEmailTemplate } from "@/features/email/templates/VerifyEmail";
import { ROLES, ROLE_OPTIONS } from "./constants/roles";
import { access } from "./access";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const Users: CollectionConfig = {
  slug: "users",

  auth: {
    verify: {
      generateEmailSubject: () => `Verify your email for ${BRAND.NAME}`,
      generateEmailHTML: async ({ token, user }) => {
        const userIdParam = user?.id ? `&userId=${user.id}` : "";
        const verificationUrl = `${serverUrl}/verify-email?token=${token}${userIdParam}`;
        return await render(createElement(VerifyEmailTemplate, { verificationUrl }));
      },
    },
    forgotPassword: {
      generateEmailSubject: () => `Reset your ${BRAND.NAME} password`,
      generateEmailHTML: async (args) => {
        const token = args?.token ?? "";
        const resetUrl = `${serverUrl}/reset-password?token=${token}`;
        return await render(createElement(ResetPasswordEmailTemplate, { resetUrl }));
      },
    },
    tokenExpiration: 60 * 60 * 24 * 30,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  },

  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role", "organization"],
  },

  defaultPopulate: {
    id: true,
    name: true,
    email: true,
    role: true,
    organization: true,
  },

  access: {
    create: access.isAdmin,
    read: access.isAdminOrSelf,
    update: access.isAdminOrSelf,
    delete: access.isAdmin,
  },

  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      defaultValue: ROLES.USER,
      options: [...ROLE_OPTIONS],
    },
    {
      name: "organization",
      type: "relationship",
      relationTo: "organizations",
    },
  ],
};
