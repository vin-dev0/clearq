"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  Bell,
  Shield,
  Mail,
  Key,
  Smartphone,
  CreditCard,
  Users,
  Upload,
  Check,
  Copy,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Crown,
  ShieldCheck,
  Loader2,
  LogOut,
} from "lucide-react";
import { redeemInvite } from "@/lib/actions/teams";
import { updateOrganizationPlan } from "@/lib/actions/organizations";
import { updateUserProfile, changePassword } from "@/lib/actions/users";
import { useRouter } from "next/navigation";

interface OrgMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plan: string;
  lastLoginAt: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export default function SettingsClient() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [inviteCode, setInviteCode] = React.useState("");
  const [isRedeeming, setIsRedeeming] = React.useState(false);
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  
  // Organization state
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [members, setMembers] = React.useState<OrgMember[]>([]);
  const [loadingOrg, setLoadingOrg] = React.useState(true);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Fetch organization data
  React.useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const res = await fetch("/api/organization");
        if (res.ok) {
          const data = await res.json();
          setOrganization(data.organization);
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setLoadingOrg(false);
      }
    };
    
    fetchOrgData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) {
        let errStr = "Upload failed";
        try { errStr = await res.text(); } catch {}
        alert("Server error: " + errStr);
        throw new Error("Upload failed");
      }
      
      const data = await res.json();
      await updateUserProfile(session?.user?.id as string, { avatar: data.url });
      await update({ user: { ...session?.user, image: data.url, avatar: data.url } });
      router.refresh();
    } catch (e: any) {
      console.error(e);
      alert("Failed to upload photo: " + (e.message || "Unknown error"));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const copyInviteLink = async () => {
    // In a real app, you'd generate an invite link or code
    const inviteUrl = `${window.location.origin}/register`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRedeemInvite = async () => {
    if (!inviteCode) return;
    setIsRedeeming(true);
    try {
      const res = await redeemInvite(inviteCode);
      alert(`Successfully joined ${res.organizationName}! Your session will now refresh.`);
      setInviteCode("");
      // Force session refresh
      await update();
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "Error redeeming invite");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleUpdatePlan = async (newPlan: string) => {
    setIsUpgrading(true);
    try {
      await updateOrganizationPlan(newPlan);
      alert(`Organization successfully upgraded to ${newPlan}!`);
      // Update session to reflect new plan
      await update();
      // Re-fetch org data
      const res = await fetch("/api/organization");
      if (res.ok) {
        const data = await res.json();
        setOrganization(data.organization);
      }
    } catch (e: any) {
      alert(e.message || "Error updating plan");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) return alert("Current password is required");
    if (!newPassword) return alert("New password is required");
    if (newPassword.length < 6) return alert("New password must be at least 6 characters");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      alert("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      alert(e.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="warning" className="gap-1"><Crown className="h-3 w-3" /> Admin</Badge>;
      case "SUPERVISOR":
        return <Badge variant="primary" className="gap-1"><Users className="h-3 w-3" /> Supervisor</Badge>;
      case "AGENT":
        return <Badge variant="default" className="gap-1">Agent</Badge>;
      case "CLIENT":
        return <Badge variant="secondary" className="gap-1">Client</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList className="mb-6">
          <Tab value="profile" icon={<User className="h-4 w-4" />}>
            Profile
          </Tab>
          <Tab value="organization" icon={<Building2 className="h-4 w-4" />}>
            Organization
          </Tab>
          <Tab value="notifications" icon={<Bell className="h-4 w-4" />}>
            Notifications
          </Tab>
          <Tab value="security" icon={<Shield className="h-4 w-4" />}>
            Security
          </Tab>
          {(session?.user as any)?.role === "ADMIN" && (
            <Tab value="billing" icon={<CreditCard className="h-4 w-4" />}>
              Billing
            </Tab>
          )}
        </TabList>

        <TabPanel value="profile">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <Avatar src={session?.user?.image} name={session?.user?.name || session?.user?.email || "User"} size="xl" />
                    <div>
                      <div className="relative inline-block">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleFileChange}
                          disabled={isUploadingPhoto}
                        />
                        <Button variant="outline" size="sm" isLoading={isUploadingPhoto} className="relative z-0">
                          <Upload className="h-4 w-4" />
                          Change Photo
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        First Name
                      </label>
                      <Input defaultValue={session?.user?.name?.split(' ')[0] || ""} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-300">
                        Last Name
                      </label>
                      <Input defaultValue={session?.user?.name?.split(' ').slice(1).join(' ') || ""} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Email
                    </label>
                    <Input type="email" defaultValue={session?.user?.email || ""} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Phone
                    </label>
                    <Input type="tel" placeholder="Add phone number" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Bio
                    </label>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Tickets Resolved</span>
                    <span className="font-semibold text-white">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Avg. Response</span>
                    <span className="font-semibold text-white">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">CSAT Score</span>
                    <span className="font-semibold text-teal-400">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Member Since</span>
                    <span className="font-semibold text-white">
                      {new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role & Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">Admin</Badge>
                    <span className="text-sm text-zinc-400">Full access</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Contact your organization admin to change permissions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="organization">
          <div className="space-y-6">
            {/* Organization Info */}
            <Card variant="gradient">
              <CardContent className="py-6">
                {loadingOrg ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                  </div>
                ) : organization ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-xl font-bold text-white">
                        {organization.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{organization.name}</h3>
                        <p className="text-zinc-400">Slug: {organization.slug}</p>
                      </div>
                    </div>
                    <Badge variant="primary" className="text-sm">
                      {organization.plan} Plan
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-zinc-600" />
                    <p className="mt-2 text-zinc-400">No organization assigned</p>
                    <p className="text-sm text-zinc-500">Contact support to set up your organization</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join New Organization (NEW) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-teal-400" />
                  Join Another Organization
                </CardTitle>
                <CardDescription>
                  Have an invite code? Enter it below to join a different team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Input 
                    placeholder="INV-XXXXXX" 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="max-w-[200px] font-mono"
                  />
                  <Button 
                    onClick={handleRedeemInvite} 
                    isLoading={isRedeeming}
                    disabled={!inviteCode}
                  >
                    Redeem Code
                  </Button>
                </div>
                <p className="mt-4 text-xs text-zinc-500">
                  Note: Joining a new organization will update your primary organization and role.
                </p>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      {members.length} member{members.length !== 1 ? "s" : ""} in your organization
                    </CardDescription>
                  </div>
                  {(session?.user as any)?.role === "ADMIN" ? (
                    <Button 
                      onClick={() => router.push("/admin/invites")} 
                      variant="outline" 
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite Member
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                {loadingOrg ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name || member.email} size="md" />
                          <div>
                            <p className="font-medium text-white">
                              {member.name || "Unnamed User"}
                              {member.id === session?.user?.id && (
                                <span className="ml-2 text-xs text-zinc-500">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-zinc-400">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRoleBadge(member.role)}
                          {member.lastLoginAt && (
                            <span className="text-xs text-zinc-500">
                              Last seen: {new Date(member.lastLoginAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-zinc-600" />
                    <p className="mt-2 text-zinc-400">No team members yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organization Settings */}
            {organization && ((session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "ADMIN") && (
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>
                    Update your organization&apos;s details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Organization Name
                    </label>
                    <Input defaultValue={organization.name} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      URL Slug
                    </label>
                    <Input defaultValue={organization.slug} disabled className="bg-zinc-900" />
                    <p className="mt-1 text-xs text-zinc-500">Cannot be changed</p>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            )}

            {/* Invite Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  How to Invite Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <p>To invite new members to your organization:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Click <strong className="text-white">Invite Member</strong> above or go to Team Invites</li>
                  <li>Choose invite type: <strong className="text-white">Direct Join</strong> or <strong className="text-white">Request Access</strong></li>
                  <li>Share the unique invite link with your team member</li>
                  <li>For Request Access, you&apos;ll need to approve pending requests</li>
                </ol>
                {(session?.user as any)?.role === "ADMIN" ? (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push("/admin/invites")}>
                    Manage Team Invites
                  </Button>
                ) : (
                  <p className="mt-2 text-xs text-zinc-500">
                    Contact your team lead or admin to get an invite link for new members.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        <TabPanel value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "New ticket assigned", description: "When a ticket is assigned to you", email: true, push: true },
                { title: "Ticket replies", description: "When a customer replies to your ticket", email: true, push: true },
                { title: "Mentions", description: "When someone mentions you in a comment", email: true, push: true },
                { title: "SLA warnings", description: "When a ticket is approaching SLA breach", email: true, push: false },
                { title: "Daily digest", description: "Summary of daily activity", email: true, push: false },
                { title: "Weekly reports", description: "Weekly performance summary", email: true, push: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={item.email}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
                      />
                      <span className="text-sm text-zinc-400">Email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={item.push}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
                      />
                      <span className="text-sm text-zinc-400">Push</span>
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabPanel>

        <TabPanel value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Current Password
                  </label>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    New Password
                  </label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Confirm New Password
                  </label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleUpdatePassword} isLoading={isUpdatingPassword}>Update Password</Button>
              </CardFooter>
            </Card>



            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage your active sessions across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-zinc-800 p-2">
                        <Smartphone className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          Current Browser
                          <Badge variant="success" className="ml-2">
                            Current
                          </Badge>
                        </p>
                        <p className="text-sm text-zinc-400">New York, US (Estimated)</p>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        <TabPanel value="billing">
          <div className="space-y-6">
            <Card variant="gradient">
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <Badge variant="primary" className="mb-2">
                    {organization?.plan || "Starter"} Plan
                  </Badge>
                  <h3 className="text-xl font-semibold text-white">
                    {organization?.plan === "PRO" ? "$99/month" : "$19/user/month"}
                  </h3>
                  <p className="text-zinc-400">
                    {organization?.plan === "PRO" 
                      ? "Unlimited tickets, Pro features unlocked for all members" 
                      : "Basic support features, upgrade for Pro tools"}
                  </p>
                </div>
                {organization?.plan !== "PRO" ? (
                  <Button 
                    variant="default" 
                    onClick={() => handleUpdatePlan("PRO")}
                    isLoading={isUpgrading}
                  >
                    Upgrade to Pro
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdatePlan("STARTER")}
                    isLoading={isUpgrading}
                  >
                    Downscale to Starter
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-4 text-center">
                   <p className="text-zinc-500 text-sm italic">No payment method added</p>
                   <Button variant="outline" size="sm" className="mt-2">Add Card</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="py-8 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-zinc-700" />
                    <p className="mt-4 text-zinc-400">No billing history found</p>
                  </div>
              </CardContent>
            </Card>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
