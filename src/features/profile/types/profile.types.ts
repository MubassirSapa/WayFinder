export type ProfileEditData = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "member";
  avatarId: string | null;
  avatarUrl: string | null;
};

export type TUpdateProfileInput = {
  name: string;
  avatarId: string | null;
  removeAvatar: boolean;
};
