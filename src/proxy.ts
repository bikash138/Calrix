import { auth } from "@/server/better-auth/auth";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/signin"];
const ONBOARDING_ROUTE = "/onboarding";
const PROTECTED_ROUTES = [
  "/chat",
  "/inbox",
  "/calendar",
  "/actions",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_ROUTE);
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isPublicRoute && !isOnboardingRoute && !isProtectedRoute)
    return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    if (isOnboardingRoute || isProtectedRoute) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  const { completedOnboarding } = session.user;

  if (pathname === "/signin") {
    return NextResponse.redirect(
      new URL(
        completedOnboarding ? "/chat" : ONBOARDING_ROUTE,
        request.url,
      ),
    );
  }

  if (isOnboardingRoute && completedOnboarding) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  const onboardingPending = request.cookies.get("onboarding_pending")?.value === "1";

  if (isProtectedRoute && !completedOnboarding && !onboardingPending) {
    return NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
