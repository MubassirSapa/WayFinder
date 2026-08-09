// Each page's own section component now owns its frame (AuthFrame or the
// split-panel AuthSplitFrame), since that choice is per-page, not global —
// see docs/project/AUTH_PAGES_REDESIGN_PLAN.md.
export default function AuthLayout({ children }: TProps) {
  return children;
}

type TProps = Readonly<{ children: React.ReactNode }>;
