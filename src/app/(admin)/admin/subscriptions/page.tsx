import * as React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  ExternalLink,
  Users,
  ShieldCheck,
  Building2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveSubscription } from "@/lib/actions/subscription";
import { revalidatePath } from "next/cache";

export default async function AdminSubscriptionsPage() {
  const session = await auth();
  const user = session?.user as any;

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const organizations = await prisma.organization.findMany({
    where: {
      subscriptionStatus: {
        in: ["PENDING_APPROVAL", "EXPIRED", "PAST_DUE"]
      }
    },
    include: {
      users: {
        where: {
          role: "ADMIN"
        },
        select: {
          email: true,
          name: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="text-zinc-400 mt-1">
            Approve manual payments and manage organization access.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {organizations.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">No organizations currently requiring attention.</p>
          </div>
        ) : (
          organizations.map((org) => (
            <div key={org.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-6 flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{org.name}</h3>
                    <p className="text-sm text-zinc-500 font-mono">{org.slug}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Users className="h-3.5 w-3.5" />
                          {org.users[0]?.email || "No Admin"}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          Trial ends: {org.trialEndsAt?.toLocaleDateString() || "N/A"}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    org.subscriptionStatus === "PENDING_APPROVAL" 
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {org.subscriptionStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-800/30 p-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <AlertCircle className="h-4 w-4" />
                  Ensure you have received the payment before approving.
                </div>
                <form action={async () => {
                  "use server";
                  await approveSubscription(org.id);
                  revalidatePath("/admin/subscriptions");
                }}>
                  <Button className="bg-teal-600 hover:bg-teal-500 text-white gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Approve Payment & Unlock
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
