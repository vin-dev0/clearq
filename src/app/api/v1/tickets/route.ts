import { NextResponse } from "next/server";
import { submitPublicTicket } from "@/lib/actions/publicTickets";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.orgSlug || !body.name || !body.email || !body.subject || !body.description) {
      return NextResponse.json({ error: "Missing required fields: orgSlug, name, email, subject, description" }, { status: 400 });
    }

    const { orgSlug, name, email, subject, description } = body;

    const result = await submitPublicTicket({ orgSlug, name, email, subject, description });
    
    return NextResponse.json({ success: true, ticketNumber: result.ticketNumber }, { status: 201 });
  } catch (error: any) {
    console.error("API Ticket Submit Error:", error);
    if (error.message === "Organization not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
