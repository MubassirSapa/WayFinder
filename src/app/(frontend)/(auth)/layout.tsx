import AuthFrame from "@/features/auth/shared/AuthFrame";

export default function AuthLayout({ children }: TProps) {
  return <AuthFrame>{children}</AuthFrame>;
}

type TProps = Readonly<{ children: React.ReactNode }>;
