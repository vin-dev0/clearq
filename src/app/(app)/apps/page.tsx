import AppsClient from "./AppsClient";

export const metadata = {
  title: "App Store - ClearQ",
  description: "Browse and install apps and integrations",
};

import { Suspense } from "react";

export default function AppsPage() {
  return (
    <Suspense fallback={<div>Loading Apps...</div>}>
      <AppsClient />
    </Suspense>
  );
}
