/**
 * Build a base64url-encoded RFC 2822 message for Gmail's `messages.send`.
 * Plain-text body only (v1). Pass `inReplyTo`/`references` to keep a reply
 * stitched into the original thread in mail clients.
 */
export function buildRawReply(opts: {
  from: string;
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const { from, to, subject, body, inReplyTo, references } = opts;

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeHeaderWord(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ];
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
  if (references) headers.push(`References: ${references}`);

  // Base64-encode the body so any UTF-8 content survives; wrap at 76 cols per RFC.
  const encodedBody =
    Buffer.from(body, "utf-8").toString("base64").match(/.{1,76}/g)?.join("\r\n") ??
    "";

  const message = `${headers.join("\r\n")}\r\n\r\n${encodedBody}`;
  return Buffer.from(message, "utf-8").toString("base64url");
}

/** RFC 2047 encoded-word — only needed when a header carries non-ASCII. */
function encodeHeaderWord(value: string): string {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}
