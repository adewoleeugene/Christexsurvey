const WHAPI_API_URL = process.env.WHAPI_API_URL || "https://gate.whapi.cloud";
const WHAPI_API_TOKEN = process.env.WHAPI_API_TOKEN || "";

async function whapiPost(endpoint: string, body: Record<string, unknown>) {
  const response = await fetch(`${WHAPI_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WHAPI send failed: ${response.status} ${errorBody}`);
  }

  return response.json();
}

export async function sendText(to: string, body: string) {
  return whapiPost("/messages/text", { to, body });
}

/** Send reply buttons (max 3 buttons, type: quick_reply) */
export async function sendButtons(
  to: string,
  body: string,
  buttons: { id: string; title: string }[]
) {
  return whapiPost("/messages/interactive", {
    to,
    type: "button",
    body: { text: body },
    action: {
      buttons: buttons.map((b) => ({
        type: "quick_reply",
        id: b.id,
        title: b.title,
      })),
    },
  });
}

/** Send a list message (up to 10 rows per section) */
export async function sendList(
  to: string,
  body: string,
  buttonLabel: string,
  rows: { id: string; title: string; description?: string }[]
) {
  return whapiPost("/messages/interactive", {
    to,
    type: "list",
    body: { text: body },
    action: {
      list: {
        label: buttonLabel,
        sections: [
          {
            title: "Options",
            rows,
          },
        ],
      },
    },
  });
}
