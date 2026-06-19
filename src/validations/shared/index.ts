import { z } from "zod";

const email = (message: string = "Invalid email") => {
  return z.email(message);
};

const name = (messages: { min?: string; max?: string } = {}) => {
  return z
    .string()
    .min(2, messages.min ?? "The name is too short.")
    .max(50, messages.max ?? "The name is too long.");
};

const password = (messages: { min?: string; strength?: string } = {}) => {
  return z
    .string()
    .min(8, messages.min ?? "The password is too short.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
      messages.strength ??
        "The password needs uppercase, lowercase, number, and special character.",
    );
};

const passwordSilent = () => {
  return z
    .string()
    .min(8)
    .refine((value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value), {
      message: "",
    });
};

const required = (message: string) => {
  return z.string().min(1, message);
};

const token = (message = "Invalid verification token") => {
  return z.string().min(10, message).max(100, message);
};

const Fields = { email, token, name, password, passwordSilent, required };
export default Fields;
