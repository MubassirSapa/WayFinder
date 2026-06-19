const AuthFrame = ({ children }: TProps) => {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-1 items-center">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </main>
  );
};

export default AuthFrame;

type TProps = Readonly<{ children: React.ReactNode }>;