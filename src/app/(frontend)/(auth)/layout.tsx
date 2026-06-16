import AuthFrame from "@/components/auth/_shared/AuthFrame";

export default function AuthLayout({ children }: TProps) {
  return <AuthFrame>{children}</AuthFrame>;
}

type TProps = Readonly<{ children: React.ReactNode }>;
