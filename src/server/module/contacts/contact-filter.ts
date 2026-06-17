/**
 * Role / automated / no-reply local-parts that should never be saved as a
 * personal contact, even if the user once emailed them.
 */
const ROLE_LOCALPART =
  /^(no-?reply|do-?not-?reply|donotreply|notifications?|notify|mailer(-daemon)?|bounce|postmaster|newsletter|news|marketing|promo(tions)?|offers|deals|alerts?|updates?|info|hello|team|support|help|sales|billing|receipts?|invoices?|accounts?|security|system|automated|auto|feedback|contact|admin|webmaster|root|daemon)$/i;

/**
 * Whether an address is worth saving as a real contact. For sent-mail
 * harvesting this is light — you don't email newsletters — so it mainly
 * rejects role/no-reply addresses and the user's own address.
 */
export function isHarvestableContact(
  email: string,
  selfEmail?: string,
): boolean {
  const e = email.toLowerCase().trim();
  if (!e.includes("@")) return false;
  if (selfEmail && e === selfEmail.toLowerCase().trim()) return false;

  const local = e.split("@")[0].split("+")[0];
  if (!local) return false;
  if (ROLE_LOCALPART.test(local)) return false;

  return true;
}
