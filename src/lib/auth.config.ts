import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/tickets") ||
        nextUrl.pathname.startsWith("/clients") ||
        nextUrl.pathname.startsWith("/messaging") ||
        nextUrl.pathname.startsWith("/reports") ||
        nextUrl.pathname.startsWith("/teams") ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/help") ||
        nextUrl.pathname.startsWith("/automations") ||
        nextUrl.pathname.startsWith("/tags") ||
        (nextUrl.pathname.startsWith("/client") && !nextUrl.pathname.startsWith("/client/login")) ||
        nextUrl.pathname.startsWith("/admin");

      if (isOnApp) {
        if (isLoggedIn) return true;
        
        if (nextUrl.pathname.startsWith("/client")) {
          return Response.redirect(new URL("/client/login", nextUrl));
        }
        
        return false; // Redirect unauthenticated users to default login page
      } else if (isLoggedIn) {
        // If logged in and on login/register page, redirect to appropriate dashboard
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/client/login") {
          const role = (auth.user as any)?.role;
          if (role === "CLIENT") {
            return Response.redirect(new URL("/client", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
