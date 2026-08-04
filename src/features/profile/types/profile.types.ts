export type ProfileEditData = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "member";
  avatarUrl: string | null;
};

export type TUpdateProfileInput = {
  name: string;
  avatarFile: File | null;
  removeAvatar: boolean;
};
