import { NextRequest, NextResponse } from "next/server";
import type { WebhookPayload } from "@/lib/types";
import {
  getEventId,
  getChatId,
  isFromMe,
  getTextBody,
  getLocation,
  getVoiceUrl,
  normalizePhone,
} from "@/lib/utils";
import { handleMessage } from "@/lib/flow";

const processedIds = new Set<string>();

export async function POST(request: NextRequest) {
  const secret = process.env.WHAPI_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-whapi-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "invalid secret" }, { status: 401 });
    }
  }

  const payload = (await request.json()) as WebhookPayload;

  console.log("Webhook payload:", JSON.stringify(payload, null, 2));

  try {
    const rawEvent = payload.event;
    const eventType = typeof rawEvent === "object" && rawEvent !== null
      ? String((rawEvent as Record<string, unknown>).type || "")
      : String(rawEvent || payload.type || "");
    const eventId = getEventId(payload);
    const chatId = getChatId(payload);

    console.log("Parsed:", { eventType, eventId, chatId, isFromMe: isFromMe(payload) });

    if (!eventType.includes("message")) {
      console.log("Skipped: event type does not include 'message'");
      return NextResponse.json({ ok: true });
    }
    if (!eventId || !chatId) {
      console.log("Skipped: missing eventId or chatId");
      return NextResponse.json({ ok: true });
    }
    if (processedIds.has(eventId)) {
      console.log("Skipped: duplicate eventId");
      return NextResponse.json({ ok: true });
    }
    if (isFromMe(payload)) {
      console.log("Skipped: message is from me");
      return NextResponse.json({ ok: true });
    }

    processedIds.add(eventId);
    if (processedIds.size > 5000) {
      processedIds.clear();
      processedIds.add(eventId);
    }

    const text = getTextBody(payload).trim();
    const location = getLocation(payload);
    const voiceUrl = getVoiceUrl(payload);
    const phone = normalizePhone(chatId);

    console.log("Message:", { text, location, voiceUrl, phone });

    if (!text && !location && !voiceUrl) {
      console.log("Skipped: no text, location, or voice");
      return NextResponse.json({ ok: true });
    }

    await handleMessage(chatId, phone, text, location, voiceUrl);
    console.log("handleMessage completed");
  } catch (error) {
    console.error("Webhook error:", error);
  }

  return NextResponse.json({ ok: true });
}
