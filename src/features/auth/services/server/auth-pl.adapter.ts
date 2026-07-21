import "server-only";

import { headers as getHeaders } from "next/headers";
import { login, logout } from "@payloadcms/next/auth";
import { getPayload } from "payload";

import config from "@payload-config";
import type { User } from "@/payload-types";
import { ROLES } from "@/collections/constants/roles";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import { errorResponse, successResponse } from "@/lib/responses/app-response";
import type { TSignin, TSignup } from "./auth.types";

const EMAIL_EXISTS_ERROR = "An account with this email already exists.";

async function getPayloadClient() {
  return getPayload({ config });
}

class EmailAlreadyExistsError extends Error {
  constructor() {
    super(EMAIL_EXISTS_ERROR);
    this.name = "EmailAlreadyExistsError";
  }
}

function isDuplicateEmailError(error: unknown) {
  if (error instanceof EmailAlreadyExistsError) return true;
  if (!(error instanceof Error)) return false;

  return /email/i.test(error.message) && /already exists|duplicate|unique/i.test(error.message);
}

function signupErrorResponse(error: unknown) {
  if (isDuplicateEmailError(error)) {
    return errorResponse(
      [{ message: EMAIL_EXISTS_ERROR, status: 409, code: "EMAIL_ALREADY_EXISTS" }],
      EMAIL_EXISTS_ERROR,
    );
  }

  return errorResponse(
    [{ message: "Could not create your account.", status: 500, code: "SIGNUP_FAILED" }],
    "Could not create your account.",
  );
}

export async function signinAdapter(data: TSignin) {
  return tryCatchResponse(() =>
    login({
      collection: "users",
      config,
      email: data.email.trim().toLowerCase(),
      password: data.password,
    }),
  );
}

export async function signupAdapter(data: TSignup) {
  const payload = await getPayloadClient();

  return tryCatchResponse(async () => {
    const email = data.email.trim().toLowerCase();
    const existingUser = await payload.find({
      collection: "users",
      overrideAccess: true,
      limit: 1,
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existingUser.totalDocs > 0) {
      throw new EmailAlreadyExistsError();
    }

    const organization = await payload.create({
      collection: "organizations",
      overrideAccess: true,
      data: {
        name: data.organization.name.trim(),
        type: data.organization.type,
      },
    });

    try {
      return await payload.create({
        collection: "users",
        overrideAccess: true,
        data: {
          name: data.name.trim(),
          email,
          password: data.password,
          role: ROLES.ADMIN,
          organization: organization.id,
        },
      });
    } catch (error) {
      await payload.delete({
        collection: "organizations",
        id: organization.id,
        overrideAccess: true,
      });
      throw error;
    }
  }, signupErrorResponse);
}

export async function logoutAdapter() {
  return tryCatchResponse(() =>
    logout({
      allSessions: true,
      config,
    }),
  );
}

export async function verifyEmailAdapter(token: string) {
  const payload = await getPayloadClient();

  return tryCatchResponse(() =>
    payload.verifyEmail({
      collection: "users",
      token,
    }),
  );
}

export async function forgotPasswordAdapter(email: string) {
  const payload = await getPayloadClient();

  return tryCatchResponse(() =>
    payload.forgotPassword({
      collection: "users",
      overrideAccess: true,
      data: {
        email: email.trim().toLowerCase(),
      },
    }),
  );
}

export async function resetPasswordAdapter(token: string, password: string) {
  const payload = await getPayloadClient();

  return tryCatchResponse(() =>
    payload.resetPassword({
      collection: "users",
      overrideAccess: true,
      data: {
        token,
        password,
      },
    }),
  );
}

export async function getCurrentUserAdapter() {
  const headers = await getHeaders();
  const payload = await getPayloadClient();

  const { user } = await payload.auth({ headers });

  if (!user) {
    return errorResponse(
      [{ message: "You need to be logged in.", status: 401, code: "UNAUTHORIZED" }],
      "You need to be logged in.",
    );
  }

  return successResponse(user as User);
}
