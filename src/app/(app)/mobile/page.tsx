import MobilePageClient from "./MobilePageClient";

// Force dynamic rendering to prevent static prerendering
export const dynamic = "force-dynamic";

export default function MobilePage() {
  return <MobilePageClient />;
}
