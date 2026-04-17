import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!api|_next/static|_next/image|favicon.ico|logo.svg|grid.svg).*)",
  ],
};
