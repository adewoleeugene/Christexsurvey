import type { WebhookPayload } from "./types";

export function getEventId(payload: WebhookPayload): string | undefined {
  const candidates = [
    payload.message?.id,
    payload.messages?.[0]?.id,
    payload.id,
    payload.event_id,
  ];
  return candidates.find(
    (v): v is string => typeof v === "string" && v.length > 0
  );
}

export function getChatId(payload: WebhookPayload): string | undefined {
  return (
    payload.chat_id ||
    payload.message?.chat_id ||
    payload.messages?.[0]?.chat_id
  );
}

export function isFromMe(payload: WebhookPayload): boolean {
  return Boolean(
    payload.from_me ||
      payload.message?.from_me ||
      payload.messages?.[0]?.from_me
  );
}

export function getTextBody(payload: WebhookPayload): string {
  const msg = payload.messages?.[0] || payload.message;
  if (msg) {
    // WHAPI sends button/list replies under msg.reply
    const reply = (msg as Record<string, unknown>).reply as
      | {
          type?: string;
          buttons_reply?: { id: string; title: string };
          list_reply?: { id: string; title: string };
        }
      | undefined;

    if (reply?.buttons_reply?.title) {
      return reply.buttons_reply.title;
    }
    if (reply?.list_reply?.title) {
      return reply.list_reply.title;
    }
  }

  return (
    payload.message?.text?.body ||
    payload.message?.body ||
    payload.messages?.[0]?.text?.body ||
    payload.messages?.[0]?.body ||
    ""
  );
}

/** Get the raw ID from a button or list reply (e.g. "btn_male", "list_1") */
export function getInteractiveReplyId(payload: WebhookPayload): string | null {
  const msg = payload.messages?.[0] || payload.message;
  if (!msg) return null;

  const interactive = msg.interactive;
  const action = (msg as Record<string, unknown>).action as
    | { button_reply?: { id: string }; list_reply?: { id: string } }
    | undefined;

  if (interactive?.button_reply?.id) return interactive.button_reply.id;
  if (action?.button_reply?.id) return action.button_reply.id;
  if (interactive?.list_reply?.id) return interactive.list_reply.id;
  if (action?.list_reply?.id) return action.list_reply.id;

  return null;
}

export function getLocation(
  payload: WebhookPayload
): { latitude: number; longitude: number } | null {
  const loc =
    payload.message?.location || payload.messages?.[0]?.location;
  if (loc && loc.latitude && loc.longitude) {
    return { latitude: loc.latitude, longitude: loc.longitude };
  }
  return null;
}

export function getVoiceUrl(payload: WebhookPayload): string | null {
  const msg = payload.messages?.[0];
  if (msg?.type === "audio" || msg?.type === "voice" || msg?.type === "ptt") {
    return msg.audio?.link || msg.voice?.link || null;
  }
  return null;
}

export function normalizePhone(chatId: string): string {
  return chatId.replace(/@s\.whatsapp\.net$/, "").replace(/@c\.us$/, "");
}
