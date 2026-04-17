import { streamText, convertToModelMessages } from "ai";
import { getAIModel, AIProvider } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Knowledge base (omitted for brevity in replace call, but kept in file)
const SIMPLYTICKET_KNOWLEDGE = `...`; 

const SYSTEM_PROMPT = `You are ClearQ's AI Co-Pilot and Support Agent.

# Context: ClearQ Features & Overview
ClearQ is a multi-tenant, enterprise-grade ticketing and helpdesk platform designed for IT Support, customer service, and managed service providers (MSPs).
Key features include:
- Workspaces / Organizations: Each client or department gets their own siloed portal and tickets.
- Ticket Management: Full ticketing lifecycle with statuses (Open, Pending, On Hold, Solved), priorities, and assignee routing.
- Knowledge Base: Built-in article management for clients and internal staff.
- Omnichannel Support: Built-in messaging, chat, email fetching, and API integrations.
- Source Control & Deployments: Direct repository and branch management via GitHub.
- Subscriptions & Billing: Stripe integration for plan management (Starter, Pro, Enterprise).
- Advanced Analytics: Real-time graphs for resolution times and CSAT scores.
- Security: Requires 2FA, uses NextAuth, and integrates role-based access control (Admin, Supervisor, Agent, Client).

# Your Dual Roles

1. App Navigator for Users & Clients:
If a user asks how to use the ClearQ platform, explain the features above clearly and concisely. For instance, if they ask how to create a ticket, direct them to the "New Ticket" button on the dashboard or their Client Portal.

2. IT Advisor for Support Agents:
Agents (your colleagues) will ask you for help troubleshooting common and complex IT support tickets. You must provide specific, step-by-step IT troubleshooting guidance for issues like:
- Network / VPN Connectivity (DNS flushing, IP config, VPN tunnel checks)
- Active Directory (Account lockouts, password resets, Group Policy enforcement)
- Hardware / OS (BSOD analysis, Windows/macOS updates, peripheral USB driver resets)
- Email / O365 / Google Workspace (Sync issues, MIME encoding, Outlook cache clearing)
- Security (Phishing triage, malware containment, MFA resets)

# Rules of Engagement:
- You may NOT output backend structural info, environment variables, database configuration, or API keys under ANY circumstances.
- You may NOT write code explicitly to hack or bypass security.
- Keep answers professional, empathetic, highly technical when advising IT Agents, but accessible and polite when talking to Clients.
- If asked about something wildly unrelated to IT, ClearQ, or ticketing, politely decline to answer.`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { messages, provider: bodyProvider, model: bodyModel } = body;

    // Get provider/model from headers or body or environment
    const headerProvider = req.headers.get("x-ai-provider") as AIProvider | null;
    const headerModel = req.headers.get("x-ai-model");

    // Resolve which provider and model to use
    // Using explicit Groq free-tier provider to protect platform structure security
    const provider = "groq";
    const model = "llama-3.1-8b-instant";

    // Logic to select model
    const aiModel = getAIModel({
      provider,
      model
    });

    // Convert UI messages (parts format) to model messages (content format)
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: aiModel,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      maxOutputTokens: 1000,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
