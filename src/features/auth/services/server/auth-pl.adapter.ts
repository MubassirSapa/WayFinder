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
const INCORRECT_PASSWORD_ERROR = "Your current password is incorrect.";

async function getPayloadClient() {
  return getPayload({ config });
}

class EmailAlreadyExistsError extends Error {
  constructor() {
    super(EMAIL_EXISTS_ERROR);
    this.name = "EmailAlreadyExistsError";
  }
}

class IncorrectPasswordError extends Error {
  constructor() {
    super(INCORRECT_PASSWORD_ERROR);
    this.name = "IncorrectPasswordError";
  }
}

function changeOwnPasswordErrorResponse(error: unknown) {
  if (error instanceof IncorrectPasswordError) {
    return errorResponse(
      [{ message: INCORRECT_PASSWORD_ERROR, status: 401, code: "INCORRECT_PASSWORD" }],
      INCORRECT_PASSWORD_ERROR,
    );
  }

  return errorResponse(
    [{ message: "Could not change your password.", status: 500, code: "PASSWORD_CHANGE_FAILED" }],
    "Could not change your password.",
  );
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
      depth: 0,
      select: {},
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
      const building = await payload.create({
        collection: "buildings",
        overrideAccess: true,
        data: {
          name: data.organization.name.trim(),
          organization: organization.id,
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
            role: ROLES.OWNER,
            organization: organization.id,
          },
        });
      } catch (error) {
        await payload.delete({
          collection: "buildings",
          id: building.id,
          overrideAccess: true,
        });
        throw error;
      }
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

// Self-service password change: verify the current password by attempting
// a real login with it (throws on a wrong password - the only way the
// Local API exposes a credential check without a network round trip
// through a real /signin), then write the new one. overrideAccess: true on
// the login call is safe here - it never mutates anything, it only proves
// the caller already knows the current password before overrideAccess:
// false + a real `user` on the update actually applies the change, going
// through the same userUpdate access every other user mutation in this app
// relies on. No targetUserId parameter at all - this can only ever act on
// the caller's own account.
export async function changeOwnPasswordAdapter(user: User, currentPassword: string, newPassword: string) {
  const payload = await getPayloadClient();

  return tryCatchResponse(async () => {
    try {
      await payload.login({
        collection: "users",
        data: { email: user.email, password: currentPassword },
        overrideAccess: true,
      });
    } catch {
      throw new IncorrectPasswordError();
    }

    await payload.update({
      collection: "users",
      id: user.id,
      user,
      overrideAccess: false,
      data: { password: newPassword },
    });
  }, changeOwnPasswordErrorResponse);
}

export async function getCurrentUserAdapter() {
  const headers = await getHeaders();
  const payload = await getPayloadClient();

  const { user } = await payload.auth({ headers });

  if (!user || user.collection !== "users") {
    return errorResponse(
      [{ message: "You need to be logged in.", status: 401, code: "UNAUTHORIZED" }],
      "You need to be logged in.",
    );
  }

  return successResponse(user satisfies User);
}
