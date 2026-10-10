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

function isInvisibleFormattingCode(code: number): boolean {
  return (
    code === 0x00ad ||
    (code >= 0x200b && code <= 0x200f) ||
    code === 0x2028 ||
    code === 0x2029 ||
    (code >= 0x202a && code <= 0x202e) ||
    (code >= 0x2066 && code <= 0x2069) ||
    code === 0xfeff
  );
}

// Zero-width, bidirectional-override and line-separator characters can disguise text.
// Plain accented letters are not affected.
export function hasInvisibleFormatting(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (isInvisibleFormattingCode(value.charCodeAt(index))) {
      return true;
    }
  }
  return false;
}
