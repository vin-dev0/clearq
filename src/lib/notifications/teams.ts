export async function sendTeamsNotification(ticket: any) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("No TEAMS_WEBHOOK_URL configured. Skipping notification.");
    return;
  }

  // Generate an absolute URL if NEXT_PUBLIC_APP_URL is available
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const ticketUrl = `${appUrl}/tickets/${ticket.id}`;

  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: `New Ticket: ${ticket.title}`,
              weight: "Bolder",
              size: "Medium"
            },
            {
              type: "TextBlock",
              text: ticket.description || "No description provided.",
              wrap: true
            },
            {
              type: "FactSet",
              facts: [
                { title: "Status:", value: ticket.status || "OPEN" },
                { title: "Priority:", value: ticket.priority || "NORMAL" }
              ]
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Ticket",
              url: ticketUrl
            }
          ]
        }
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Failed to send MS Teams notification. Status: ${response.status}`);
    } else {
      console.log("Successfully dispatched MS Teams alert.");
    }
  } catch (error) {
    console.error("Error sending notification to Teams:", error);
  }
}
