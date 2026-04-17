"use client";

import { useSession } from "next-auth/react";
import { getTranslation } from "@/lib/translations";

export function useTranslation() {
  const { data: session } = useSession();
  
  // Use organization default language from session
  // We'll need to make sure the session includes the org's default language
  const locale = (session?.user as any)?.locale || "en";

  const t = (key: string) => {
    return getTranslation(locale, key);
  };

  return { t, locale };
}
