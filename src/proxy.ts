import { NextRequest, NextResponse } from "next/server";

import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";

const authRoutes = new Set<string>([
  PUBLIC_ROUTES.SIGNIN,
  PUBLIC_ROUTES.SIGNUP,
  PUBLIC_ROUTES.REGISTER_ORGANIZATION,
  PUBLIC_ROUTES.FORGOT_PASSWORD,
  PUBLIC_ROUTES.RESET_PASSWORD,
]);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("payload-token")?.value;
  const isPrivateRoute =
    pathname.startsWith(PRIVATE_ROUTES.DASHBOARD) || pathname.startsWith(PRIVATE_ROUTES.EDITOR);
  const isAuthRoute = authRoutes.has(pathname);

  if (isPrivateRoute && !token) {
    return NextResponse.redirect(new URL(PUBLIC_ROUTES.SIGNIN, request.url));
  }

  if (!isAuthRoute || !token) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(new URL("/api/users/me", request.url), {
      method: "GET",
      headers: {
        Authorization: `JWT ${token}`,
      },
      credentials: "include",
      cache: "no-store",
    });

    const data = response.ok ? await response.json().catch(() => null) : null;

    if (data?.user) {
      return NextResponse.redirect(new URL(PRIVATE_ROUTES.DASHBOARD, request.url));
    }
  } catch {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/signin",
    "/signup",
    "/register-organization",
    "/forgot-password",
    "/reset-password",
  ],
};
