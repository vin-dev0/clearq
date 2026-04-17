"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Video,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Users,
} from "lucide-react";

const quickLinks = [
  { title: "Video Tutorials", icon: Video, href: "#" },
  { title: "API Documentation", icon: FileText, href: "#" },
  { title: "Community Forum", icon: Users, href: "#" },
];

const faqItems = [
  {
    question: "How do I create a new ticket?",
    answer: "Click the 'New Ticket' button in the sidebar or navigate to Tickets > New Ticket. Fill in the required fields and submit.",
  },
  {
    question: "How do I assign a ticket to a team member?",
    answer: "Open the ticket, then use the 'Assignee' dropdown in the sidebar to select a team member.",
  },
  {
    question: "What do the different ticket statuses mean?",
    answer: "Open = New ticket, Pending = Waiting for customer, On Hold = Paused, Solved = Resolved, Closed = Completed.",
  },
  {
    question: "How do I set up email forwarding?",
    answer: "Go to Settings > Email > Forwarding and add your support email address. Follow the verification steps.",
  },
  {
    question: "Can I customize the ticket fields?",
    answer: "Yes! Go to Settings > Tickets > Custom Fields to add, edit, or remove custom fields for your tickets.",
  },
];

const supportOptions = [
  {
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    icon: MessageCircle,
    action: "Start Chat",
    available: true,
  },
  {
    title: "Email Support",
    description: "Get help via email within 24 hours",
    icon: Mail,
    action: "Send Email",
    available: true,
  },
  {
    title: "Phone Support",
    description: "Available Mon-Fri, 9am-6pm EST",
    icon: Phone,
    action: "Call Now",
    available: true,
  },
];

export default function HelpClient() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">How can we help you?</h1>
        <p className="mt-2 text-zinc-400">
          Find answers to common questions or contact our support team
        </p>
        <div className="mx-auto mt-6 max-w-xl">
          <Input
            placeholder="Search for help articles..."
            icon={<Search className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.title} href={link.href}>
            <Card hover className="cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-lg bg-teal-500/10 p-3">
                  <link.icon className="h-6 w-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{link.title}</h3>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqItems.map((faq, index) => (
              <Card
                key={index}
                className="cursor-pointer"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-teal-400" />
                      <h3 className="font-medium text-white">{faq.question}</h3>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-zinc-500 transition-transform ${
                        expandedFaq === index ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  {expandedFaq === index && (
                    <p className="mt-3 pl-8 text-zinc-400">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            {/* Removed View All Help Articles link */}
          </div>
        </div>

        {/* Contact Support */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Contact Support
          </h2>
          <div className="space-y-4">
            {supportOptions.map((option) => (
              <Card key={option.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-teal-500/10 p-3">
                      <option.icon className="h-6 w-6 text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{option.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {option.description}
                      </p>
                      <Button size="sm" className="mt-3">
                        {option.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status */}
          <Card className="mt-6" variant="gradient">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-white">All Systems Operational</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Last checked 2 minutes ago
              </p>
              <a
                href="#"
                className="mt-3 inline-flex items-center gap-1 text-sm text-teal-400 hover:underline"
              >
                View Status Page
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

