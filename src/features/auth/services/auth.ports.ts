import {
  forgotPasswordAdapter,
  getCurrentUserAdapter,
  logoutAdapter,
  resetPasswordAdapter,
  signinAdapter,
  signupAdapter,
  verifyEmailAdapter,
} from "./auth-pl.adapter";
import type { TSignin, TSignup } from "./auth.types";

export async function signIn(data: TSignin) {
  return signinAdapter(data);
}

export async function signUp(data: TSignup) {
  return signupAdapter(data);
}

export async function logout() {
  return logoutAdapter();
}

export async function verifyEmail(token: string) {
  return verifyEmailAdapter(token);
}

export async function forgotPassword(email: string) {
  return forgotPasswordAdapter(email);
}

export async function resetPassword(token: string, password: string) {
  return resetPasswordAdapter(token, password);
}

export async function getCurrentUser() {
  return getCurrentUserAdapter();
}
