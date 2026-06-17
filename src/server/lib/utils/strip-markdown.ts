/**
 * Safety net for AI-composed email bodies: strip the markdown an LLM sometimes
 * emits despite being told not to, since email clients render it as literal
 * symbols. Conservative — only touches unambiguous markdown, leaving plain
 * punctuation, numbered lists, and stray single * / _ untouched.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1") // **bold**
    .replace(/__(.+?)__/g, "$1") // __bold__
    .replace(/`([^`]+)`/g, "$1") // `code`
    .replace(/^#{1,6}\s+/gm, "") // # headings
    .replace(/^>\s?/gm, ""); // > blockquotes
}
