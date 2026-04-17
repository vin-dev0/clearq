import { getIntegrationsConfig } from "@/lib/actions/integrations";

export async function sendIntegrationNotifications(ticket: any) {
  try {
    const db = await getIntegrationsConfig();
    if (!db || !db.apps || !db.webhooks) return;

    const apps = db.apps;
    const webhooks = db.webhooks;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ticketUrl = `${appUrl}/tickets/${ticket.id}`;

    // 1. SLACK
    if (apps["slack"] === "INSTALLED" && webhooks.slack_webhook) {
      await fetch(webhooks.slack_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*🎫 New Ticket Created: ${ticket.subject}*\n> *Priority:* ${ticket.priority}\n> *Type:* ${ticket.type}\n> *Status:* ${ticket.status}\n> *Description:* ${ticket.description?.substring(0, 200)}${ticket.description?.length > 200 ? '...' : ''}\n\n<${ticketUrl}|View in ClearQ Dashboard>`
        })
      }).catch(e => console.error("Slack Notify Failure", e));
    }

    // 2. DISCORD
    if (apps["discord"] === "INSTALLED" && webhooks.discord_webhook) {
      await fetch(webhooks.discord_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: webhooks.discord_botname || "ClearQ Alerts",
          avatar_url: "https://ui-avatars.com/api/?name=ST&background=14b8a6&color=fff",
          embeds: [{
            title: `🎫 New Ticket: ${ticket.subject}`,
            url: ticketUrl,
            description: ticket.description?.substring(0, 1000),
            color: 1342177,
            fields: [
              { name: "Type", value: ticket.type || "N/A", inline: true },
              { name: "Priority", value: ticket.priority || "N/A", inline: true },
              { name: "Status", value: ticket.status || "N/A", inline: true }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(e => console.error("Discord Notify Failure", e));
    }

    // 3. TEAMS
    if (apps["teams"] === "INSTALLED" && webhooks.teams_webhook) {
      await fetch(webhooks.teams_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "themeColor": "14b8a6",
          "summary": "🎫 New Ticket Created",
          "sections": [{
            "activityTitle": `New Ticket: ${ticket.subject}`,
            "activitySubtitle": new Date().toISOString(),
            "facts": [
              { "name": "Priority", "value": ticket.priority },
              { "name": "Type", "value": ticket.type }
            ],
            "text": ticket.description?.substring(0, 300)
          }],
          "potentialAction": [{
            "@type": "OpenUri",
            "name": "View Ticket",
            "targets": [{ "os": "default", "uri": ticketUrl }]
          }]
        })
      }).catch(e => console.error("Teams Notify Failure", e));
    }

    // 4. ZAPIER
    if (apps["zapier"] === "INSTALLED" && webhooks.zapier_webhook) {
      await fetch(webhooks.zapier_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "ticket.created",
          data: { ...ticket, url: ticketUrl }
        })
      }).catch(e => console.error("Zapier Notify Failure", e));
    }

  } catch (error) {
    console.error("Integration notification dispatcher error:", error);
  }
}
