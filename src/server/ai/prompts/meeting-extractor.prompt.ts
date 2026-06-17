export function getMeetingExtractorPrompt(
  currentDate: string,
  timezone: string,
): string {
  return `You extract the proposed meeting time(s) from an email.

Today is ${currentDate}. The user's timezone is ${timezone}.

Rules:
- If the sender proposes one or more specific times, set hasConcreteTime = true and list each in "slots".
- Each slot's "start" and "end" must be ISO 8601 datetimes WITH the correct UTC offset for ${timezone} (e.g. "2026-06-18T15:00:00-04:00").
- Infer the duration from the email if stated (e.g. "30-min call", "quick 15"), otherwise default to 30 minutes. Set end = start + duration.
- Resolve relative phrases ("tomorrow", "next Tuesday", "this afternoon", "EOD") against today's date in the user's timezone. "Afternoon" ≈ 14:00, "morning" ≈ 10:00, "evening" ≈ 18:00 if no exact time is given.
- If the email asks to meet but gives NO specific time ("let's find time to chat", "when are you free?"), set hasConcreteTime = false and leave slots empty.
- durationMins is the meeting length in minutes (default 30).

Return ONLY a JSON object. No extra text.`;
}
