import { sql } from "./db";
import type { Session, Report } from "./types";

export async function getSession(phone: string): Promise<Session | null> {
  const rows = await sql`
    SELECT id, phone, current_step, answers, started_at, updated_at
    FROM sessions WHERE phone = ${phone} LIMIT 1
  `;
  return (rows[0] as Session) || null;
}

export async function upsertSession(
  phone: string,
  currentStep: number,
  answers: Record<string, string>
): Promise<void> {
  await sql`
    INSERT INTO sessions (phone, current_step, answers, updated_at)
    VALUES (${phone}, ${currentStep}, ${JSON.stringify(answers)}, now())
    ON CONFLICT (phone) DO UPDATE SET
      current_step = ${currentStep},
      answers = ${JSON.stringify(answers)},
      updated_at = now()
  `;
}

export async function deleteSession(phone: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE phone = ${phone}`;
}

export async function createReport(
  phone: string,
  answers: Record<string, string>,
  latitude: number | null,
  longitude: number | null,
  voiceUrls: string[]
): Promise<string> {
  const rows = await sql`
    INSERT INTO reports (phone, latitude, longitude, answers, voice_urls)
    VALUES (${phone}, ${latitude}, ${longitude}, ${JSON.stringify(answers)}, ${JSON.stringify(voiceUrls)})
    RETURNING id
  `;
  return rows[0].id as string;
}

export async function getReports(): Promise<Report[]> {
  const rows = await sql`
    SELECT id, phone, latitude, longitude, answers, voice_urls, submitted_at
    FROM reports ORDER BY submitted_at DESC
  `;
  return rows as Report[];
}

export async function getReportById(id: string): Promise<Report | null> {
  const rows = await sql`
    SELECT id, phone, latitude, longitude, answers, voice_urls, submitted_at
    FROM reports WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as Report) || null;
}
