import { withClerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Set the paths that don't require the user to be signed in
const publicPaths = ["/", "/signin*", "/signup*"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

export default withClerkMiddleware((request: NextRequest) => {
  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request);

  if (userId === null && isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (userId === null) {
    // redirect the users to /pages/signin/[[...index]].ts
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isPublic(request.nextUrl.pathname)) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
