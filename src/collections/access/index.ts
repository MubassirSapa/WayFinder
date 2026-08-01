import type { Access } from "payload";

/**
 * Public access
 */
export const anyone: Access = () => {
  return true;
};

export const noOne: Access = () => {
  return false;
};

/**
 * Auth access
 */
export const isLoggedIn: Access = ({ req: { user } }) => {
  return Boolean(user);
};

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.collection === "admins";
};

/**
 * Self access
 * Best for the Users collection (user.id === document id).
 */
export const isSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;

  return user.id === id;
};

export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;

  if (user.collection === "admins") return true;

  return user.id === id;
};

/**
 * Grouped access object
 */
export const access = {
  anyone,
  noOne,

  isLoggedIn,
  isAdmin,

  isSelf,
  isAdminOrSelf,
};
