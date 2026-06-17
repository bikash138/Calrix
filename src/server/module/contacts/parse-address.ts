export type ParsedAddress = { name: string; email: string };

/**
 * Parse an email header value (To/Cc/From) into {name,email} pairs.
 * Handles: `"Bikash Shaw" <a@b.com>`, `Bikash <a@b.com>`, `a@b.com`,
 * comma-separated lists. Emails are lowercased. When no display name is
 * present, the local-part is used as a (searchable) fallback name.
 */
export function parseAddressList(header?: string | null): ParsedAddress[] {
  if (!header) return [];
  return header
    .split(",")
    .map(parseSingle)
    .filter((a): a is ParsedAddress => a !== null);
}

function parseSingle(raw: string): ParsedAddress | null {
  const s = raw.trim();
  if (!s) return null;

  let name = "";
  let email = "";

  const angle = s.match(/^(.*)<([^>]+)>\s*$/);
  if (angle) {
    name = stripQuotes(angle[1].trim());
    email = angle[2].trim();
  } else {
    email = stripQuotes(s);
  }

  email = email.toLowerCase();
  if (!email.includes("@")) return null;

  if (!name) {
    name = email.split("@")[0].replace(/[._]+/g, " ").trim();
  }

  return { name, email };
}

function stripQuotes(v: string): string {
  return v.replace(/^"(.*)"$/, "$1").trim();
}
