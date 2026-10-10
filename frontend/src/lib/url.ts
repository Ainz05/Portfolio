import { hasNonPrintableAscii } from './characters';
import { buildMailto } from './mailto';

// Backslashes: browsers treat them like slashes, a classic filter bypass. Whitespace, control and
// non-ASCII characters are rejected separately by hasNonPrintableAscii (tab/CR/LF are silently
// stripped by browsers, so "java<newline>script:" would otherwise work).
const BACKSLASH = '\\';

const HTTPS_PREFIX = /^https:\/\/[^/?#]/i;
const MAILTO_PREFIX = /^mailto:\S/i;

// `URL.parse` is too recent for the es2022 build target (Chrome 126+, Safari 18+).
function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function decodeOrNull(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function hasOnlyAllowedMailtoParams(parsed: URL): boolean {
  return [...parsed.searchParams.keys()].every(
    (key) => (key === 'subject' || key === 'body') && parsed.searchParams.getAll(key).length === 1,
  );
}

// A mailto: link is accepted only in the exact form buildMailto produces (one valid recipient,
// optional subject and body, nothing else), then rebuilt by buildMailto so it is re-validated.
function sanitizeMailto(value: string, parsed: URL): string | null {
  const to = decodeOrNull(parsed.pathname);
  if (to === null || parsed.hash !== '' || !MAILTO_PREFIX.test(value)) {
    return null;
  }
  if (!hasOnlyAllowedMailtoParams(parsed)) {
    return null;
  }
  return buildMailto({
    to,
    subject: parsed.searchParams.get('subject') ?? undefined,
    body: parsed.searchParams.get('body') ?? undefined,
  });
}

function isSafeHttps(value: string, parsed: URL): boolean {
  const hasCredentials = parsed.username !== '' || parsed.password !== '';
  return HTTPS_PREFIX.test(value) && parsed.hostname !== '' && !hasCredentials;
}

/**
 * Returns the normalized URL when `value` is a safe absolute `https:` or `mailto:` URL,
 * `null` otherwise. Everything else (javascript:, data:, vbscript:, http:, relative or
 * protocol-relative URLs, credentials in the URL) is rejected.
 */
export function sanitizeUrl(value: string): string | null {
  if (value === '' || value.includes(BACKSLASH) || hasNonPrintableAscii(value)) {
    return null;
  }
  const parsed = parseUrl(value);
  if (parsed?.protocol === 'mailto:') {
    return sanitizeMailto(value, parsed);
  }
  return parsed?.protocol === 'https:' && isSafeHttps(value, parsed) ? parsed.href : null;
}

export function isSafeUrl(value: string): boolean {
  return sanitizeUrl(value) !== null;
}

/** Only `https:` URLs may open in a new tab; `mailto:` stays in the current context. */
export function isExternalHttpsUrl(value: string): boolean {
  return sanitizeUrl(value)?.startsWith('https:') === true;
}
