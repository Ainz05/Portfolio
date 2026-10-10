import { hasControlCharacter, hasInvisibleFormatting, hasLoneSurrogate } from './characters';

export interface MailtoOptions {
  readonly to: string;
  readonly subject?: string | undefined;
  readonly body?: string | undefined;
}

const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 1500;
const MAX_MAILTO_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;

// Deliberately stricter than RFC 5322: no quotes, no "%", no separators. One plain address only,
// so nothing in `to` can add recipients (",", ";") or parameters ("?", "&").
const EMAIL_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9._+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

const LINE_BREAKS = /\r\n|\r|\n/g;

export function isValidEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(value);
}

function hasUnsafeText(value: string): boolean {
  return hasLoneSurrogate(value) || hasInvisibleFormatting(value);
}

function isValidSubject(subject: string): boolean {
  return (
    subject.length <= MAX_SUBJECT_LENGTH && !hasControlCharacter(subject) && !hasUnsafeText(subject)
  );
}

function isValidBody(body: string): boolean {
  return (
    body.length <= MAX_BODY_LENGTH &&
    !hasControlCharacter(body, { allowNewlines: true }) &&
    !hasUnsafeText(body)
  );
}

function buildQuery(subject: string | undefined, body: string | undefined): string {
  const params: string[] = [];
  if (subject !== undefined && subject !== '') {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }
  if (body !== undefined && body !== '') {
    // RFC 6068: line breaks in the body are CRLF, percent-encoded.
    params.push(`body=${encodeURIComponent(body.replace(LINE_BREAKS, '\r\n'))}`);
  }
  return params.length > 0 ? `?${params.join('&')}` : '';
}

/**
 * Builds a `mailto:` URL, or returns `null` when an input is unsafe or the address is invalid
 * (for example while the contact email is still a placeholder: the caller then shows the
 * placeholder text without a link). Only `subject` and `body` are ever emitted as parameters,
 * so `cc`/`bcc` cannot be injected. A subject with line breaks is rejected rather than
 * encoded, because mail clients may decode it back into extra headers.
 */
export function buildMailto({ to, subject, body }: MailtoOptions): string | null {
  if (!isValidEmail(to)) {
    return null;
  }
  if (subject !== undefined && !isValidSubject(subject)) {
    return null;
  }
  if (body !== undefined && !isValidBody(body)) {
    return null;
  }
  const url = `mailto:${to}${buildQuery(subject, body)}`;
  return url.length <= MAX_MAILTO_LENGTH ? url : null;
}
