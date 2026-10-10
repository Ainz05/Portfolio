const LINE_FEED = 0x0a;
const CARRIAGE_RETURN = 0x0d;

function isControlCode(code: number): boolean {
  return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
}

// Done with char codes rather than a regex: ESLint's no-control-regex rightly forbids
// control characters in patterns, and this check must not be weakened.
export function hasControlCharacter(value: string, { allowNewlines = false } = {}): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    const isNewline = code === LINE_FEED || code === CARRIAGE_RETURN;
    if (isControlCode(code) && !(allowNewlines && isNewline)) {
      return true;
    }
  }
  return false;
}

function isHighSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
  return code >= 0xdc00 && code <= 0xdfff;
}

// `encodeURIComponent` throws a URIError on a lone surrogate half.
export function hasLoneSurrogate(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (isHighSurrogate(code) && isLowSurrogate(value.charCodeAt(index + 1))) {
      index += 1;
    } else if (isHighSurrogate(code) || isLowSurrogate(code)) {
      return true;
    }
  }
  return false;
}

// Anything outside printable ASCII (space and DEL included). Used for URLs, where lookalike
// (homoglyph) or invisible characters must not slip through: an IDN has to be written as xn--.
export function hasNonPrintableAscii(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x21 || code > 0x7e) {
      return true;
    }
  }
  return false;
}

// Format characters (Cf: zero-width, bidi controls, tags, soft hyphen, BOM...) and line/paragraph
// separators (Zl, Zp), plus the blank-looking characters that Unicode does not class as Cf:
// combining grapheme joiner, Hangul fillers. \p{Default_Ignorable_Code_Point} is avoided on
// purpose: it contains U+FE0F, which legitimate emoji need. Plain accented letters are unaffected.
const INVISIBLE_FORMATTING = /[\p{Cf}\p{Zl}\p{Zp}\u{34F}\u{115F}\u{1160}\u{3164}\u{FFA0}]/u;

export function hasInvisibleFormatting(value: string): boolean {
  return INVISIBLE_FORMATTING.test(value);
}
