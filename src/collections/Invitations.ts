import type { CollectionConfig } from "payload";

import { access } from "./access";
import { ROLES } from "./constants/roles";

export const Invitations: CollectionConfig = {
  slug: "invitations",

  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "organization", "status", "expiresAt"],
  },

  access: {
    create: access.invitationCreate,
    read: access.invitationRead,
    update: access.noOne,
    delete: access.noOne,
  },

  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      options: [
        { value: ROLES.MANAGER, label: "Manager" },
        { value: ROLES.MEMBER, label: "Member" },
      ],
    },
    {
      name: "organization",
      type: "relationship",
      relationTo: "organizations",
      required: true,
      index: true,
    },
    {
      name: "buildings",
      type: "relationship",
      relationTo: "buildings",
      hasMany: true,
      admin: {
        condition: (data) => data?.role === ROLES.MEMBER,
        description: "Buildings the invitee will be assigned to on acceptance. Only applies to the member role.",
      },
    },
    {
      name: "tokenHash",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { value: "pending", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "revoked", label: "Revoked" },
      ],
      index: true,
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
    },
    {
      name: "acceptedAt",
      type: "date",
    },
    {
      name: "invitedBy",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
  ],
};
