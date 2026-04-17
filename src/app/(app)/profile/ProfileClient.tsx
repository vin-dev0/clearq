"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ticket,
  Clock,
  ThumbsUp,
  Upload,
  Edit,
  Shield,
} from "lucide-react";

export default function ProfileClient() {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-zinc-400">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar name="Alex Johnson" size="xl" />
                  <button className="absolute bottom-0 right-0 rounded-full bg-teal-500 p-2 text-white shadow-lg hover:bg-teal-400">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">Alex Johnson</h2>
                <p className="text-zinc-400">alex.johnson@company.com</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="primary">Admin</Badge>
                  <Badge variant="success" dot>Online</Badge>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-zinc-800 pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-300">alex.johnson@company.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-300">New York, USA</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-300">Joined January 2023</span>
                </div>
              </div>

              <Button variant="outline" className="mt-6 w-full" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-zinc-400">Tickets Resolved</span>
                </div>
                <span className="font-semibold text-white">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-zinc-400">Avg Response Time</span>
                </div>
                <span className="font-semibold text-white">12m</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-zinc-400">Satisfaction Rate</span>
                </div>
                <span className="font-semibold text-emerald-400">98%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    First Name
                  </label>
                  <Input defaultValue="Alex" disabled={!isEditing} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Last Name
                  </label>
                  <Input defaultValue="Johnson" disabled={!isEditing} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email Address
                </label>
                <Input type="email" defaultValue="alex.johnson@company.com" disabled={!isEditing} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Phone Number
                </label>
                <Input type="tel" defaultValue="+1 (555) 123-4567" disabled={!isEditing} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Department
                </label>
                <Input defaultValue="Customer Support" disabled={!isEditing} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Bio
                </label>
                <Textarea
                  defaultValue="Senior Support Agent with 5+ years of experience in technical support and customer success. Passionate about helping customers solve their problems quickly and efficiently."
                  rows={4}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Security Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-400" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
                <div>
                  <p className="font-medium text-white">Password</p>
                  <p className="text-sm text-zinc-400">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
                <div>
                  <p className="font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-zinc-400">Add an extra layer of security</p>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

