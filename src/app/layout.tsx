import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import GoogleAnalytics from "@/components/integrations/GoogleAnalytics";

export const metadata: Metadata = {
  title: "ClearQ - Enterprise Help Desk Solution",
  description: "A powerful, scalable help desk and ticket management system for modern support teams.",
  keywords: ["help desk", "ticketing system", "customer support", "support tickets", "help center", "ClearQ"],
  authors: [{ name: "ClearQ" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <GoogleAnalytics />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
