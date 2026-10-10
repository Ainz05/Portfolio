const MAX_LENGTH = 200;

// "#" + HTML-safe id: starts with a letter, ASCII only.
const ANCHOR_PATTERN = /^#[A-Za-z][A-Za-z0-9_-]{0,63}$/;

// Same-origin absolute path: one leading "/", then segments of ASCII letters, digits, "_", "-"
// and "." that never start with "." (no "..", no hidden files), no "%", "?", "#" or "\".
// A "//" cannot match since every segment needs at least one character.
const PATH_PATTERN = /^(?:\/[A-Za-z0-9_][A-Za-z0-9_.-]*)+$/;

/**
 * Validates an in-site link: a `#anchor` or a same-origin path such as `/cv/cv.pdf`.
 * Returns it unchanged (it is already canonical) or `null`. Deliberately separate from
 * `sanitizeUrl`, which stays limited to absolute `https:` and `mailto:` URLs.
 */
export function sanitizeInternalHref(value: string): string | null {
  if (value.length > MAX_LENGTH) {
    return null;
  }
  return ANCHOR_PATTERN.test(value) || PATH_PATTERN.test(value) ? value : null;
}
