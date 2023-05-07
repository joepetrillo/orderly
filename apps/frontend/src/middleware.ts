import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/signin", "/signup", "/404"],
  afterAuth(auth, req) {
    // not logged in and trying to go to private page, redirect to root
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // logged in and trying to go to public page, redirect to courses
    if (auth.userId && auth.isPublicRoute) {
      const coursesURL = new URL("/courses", req.url);
      return NextResponse.redirect(coursesURL);
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
