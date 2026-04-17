"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-zinc-400 mb-12">Last updated: January 1, 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-300 leading-relaxed">
              By accessing or using ClearQ (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, you may not use the Service. These terms apply to all users, 
              including administrators, agents, and end-users.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-zinc-300 leading-relaxed">
              ClearQ provides a cloud-based help desk and customer support platform that enables organizations 
              to manage customer inquiries, support tickets, and team collaboration. The Service includes ticket 
              management, knowledge base, analytics, and related features as described on our website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              To use the Service, you must create an account and provide accurate, complete information. You are 
              responsible for:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring your account information remains current and accurate</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Transmit malicious code, spam, or harmful content</li>
              <li>Attempt to gain unauthorized access to systems or data</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Payment and Billing</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable 
              except as required by law. We reserve the right to modify pricing with 30 days notice.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Grace Period Policy</h3>
              <p className="text-zinc-300 leading-relaxed mb-3">
                If payment fails or your subscription expires, you will have a <strong className="text-amber-400">3-day grace period</strong> to 
                update your payment information. During this time:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>You may still log in to your account</li>
                <li>Access to features will be restricted</li>
                <li>You can update payment methods and renew your subscription</li>
                <li>Pro plan members can export their data</li>
              </ul>
            </div>
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Account Lockout & Data Retention</h3>
              <p className="text-zinc-300 leading-relaxed mb-3">
                After the 3-day grace period expires:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li><strong className="text-red-400">Immediate:</strong> Your account will be locked, and you will no longer be able to access the Service</li>
                <li><strong className="text-red-400">30 days after lockout:</strong> All account data, including tickets, assets, messages, and user information, 
                  will be <strong>permanently deleted</strong> from our systems</li>
              </ul>
              <p className="text-zinc-400 text-sm mt-3 italic">
                We strongly recommend exporting your data before your subscription expires. Pro plan members have access 
                to a data export feature.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data and Privacy</h2>
            <p className="text-zinc-300 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. You retain adminship of your data. 
              We process your data only as necessary to provide the Service and as described in our Privacy Policy. 
              You are responsible for ensuring you have the right to upload and process any data through the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
            <p className="text-zinc-300 leading-relaxed">
              ClearQ and its licensors retain all rights to the Service, including all software, designs, 
              trademarks, and documentation. You receive a limited, non-exclusive license to use the Service 
              during your subscription period. You may not copy, modify, or reverse engineer any part of the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability</h2>
            <p className="text-zinc-300 leading-relaxed">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. The Service may be 
              temporarily unavailable for maintenance, updates, or circumstances beyond our control. We will 
              provide reasonable notice of planned maintenance when possible.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-zinc-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIMPLYTICKET SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES. 
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Termination & Data Deletion</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Either party may terminate this agreement at any time. Upon termination or account lockout:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4 mb-4">
              <li>Your access to the Service will cease immediately</li>
              <li>You will have <strong className="text-amber-400">3 days</strong> to reactivate by updating payment or contacting support</li>
              <li>After <strong className="text-red-400">30 days</strong> of inactivity following lockout, all your data will be <strong>permanently deleted</strong></li>
              <li>This includes: tickets, comments, assets, messages, team data, and all associated files</li>
              <li>Data deletion is irreversible and cannot be recovered</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed">
              Provisions that by their nature should survive termination (including but not limited to intellectual 
              property rights, limitation of liability, and dispute resolution) will remain in effect.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may update these Terms from time to time. We will notify you of material changes via email or 
              through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p className="text-zinc-300 leading-relaxed">
              These Terms are governed by the laws of the State of New York, United States, without regard to 
              conflict of law principles. Any disputes shall be resolved in the courts of New York County, New York.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
            <p className="text-zinc-300 leading-relaxed">
              For questions about these Terms, please contact us at:<br /><br />
              ClearQ Inc.<br />
              350 Fifth Avenue, Suite 4820<br />
              New York, NY 10118<br />
              Email: legal@ClearQ.net
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm text-zinc-500">
            © 2026 ClearQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

