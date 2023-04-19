import { withClerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Set the paths that don't require the user to be signed in
const publicPaths = ["/", "/signin*", "/signup*", "/404"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

export default withClerkMiddleware((request: NextRequest) => {
  const { userId } = getAuth(request);

  // NOT logged in and trying to access public (not protected) page, allow this
  if (userId === null && isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // NOT logged in and trying to access protected page, redirect to sign in
  if (userId === null) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // IS logged in and trying to access public page, redirect to courses
  if (isPublic(request.nextUrl.pathname)) {
    const coursesURL = new URL("/courses", request.url);
    return NextResponse.redirect(coursesURL);
  }

  // IS logged in and trying to access protected page, allow this
  return NextResponse.next();
});

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
