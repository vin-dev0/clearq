import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SupportForm from "./SupportForm";

export default async function SupportPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { name: true, logo: true, slug: true }
  });

  if (!org) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="flex flex-col items-center mb-8">
          {org.logo ? (
            <img src={org.logo} alt={org.name} className="h-12 mb-4" />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-teal-400">{org.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-white text-center">Contact {org.name} Support</h1>
          <p className="mt-2 text-zinc-400 text-center">Submit a ticket and our team will get back to you shortly.</p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <SupportForm orgSlug={org.slug} />
        </div>
      </div>
    </div>
  );
}
