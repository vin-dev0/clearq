"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getIntegrationsConfig } from "@/lib/actions/integrations";

export default function GoogleAnalytics() {
  const [measurementId, setMeasurementId] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const db = await getIntegrationsConfig();
        if (db && db.apps && db.apps["google-analytics"] === "INSTALLED" && db.webhooks && db.webhooks.ga_measurement_id) {
          setMeasurementId(db.webhooks.ga_measurement_id);
        }
      } catch (err) {
        console.error("GA initialization error:", err);
      }
    }
    loadConfig();
  }, []);

  if (!measurementId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
