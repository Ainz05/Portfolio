import {
  hasControlCharacter,
  hasInvisibleFormatting,
  hasLoneSurrogate,
  hasNonPrintableAscii,
} from './characters';

describe('hasControlCharacter', () => {
  it.each(['\u0000', 'a\tb', 'a\nb', 'a\rb', '\u007f', '\u0085', '\u009f'])(
    'detects %j',
    (value) => {
      expect(hasControlCharacter(value)).toBe(true);
    },
  );

  it.each(['', 'plain text', 'accentué — ok', '\u{a0}'])('accepts %j', (value) => {
    expect(hasControlCharacter(value)).toBe(false);
  });

  it('can allow line breaks only', () => {
    expect(hasControlCharacter('a\r\nb', { allowNewlines: true })).toBe(false);
    expect(hasControlCharacter('a\tb', { allowNewlines: true })).toBe(true);
  });
});

describe('hasLoneSurrogate', () => {
  it.each(['\ud800', '\udc00', 'a\ud800b', '\udc00\ud800', 'x\ud83d'])('detects %j', (value) => {
    expect(hasLoneSurrogate(value)).toBe(true);
  });

  it.each(['', 'abc', '😀', 'a😀b', 'é'])('accepts %j', (value) => {
    expect(hasLoneSurrogate(value)).toBe(false);
  });
});

describe('hasNonPrintableAscii', () => {
  it.each([
    ' ',
    'a b',
    '\u0000',
    '\u007f',
    '\u{ad}',
    '\u{200b}',
    '\u{202e}',
    '\u{2028}',
    '\u{feff}',
    'é',
    '\u{430}pple',
  ])('detects %j', (value) => {
    expect(hasNonPrintableAscii(value)).toBe(true);
  });

  it.each(['', 'https://example.com/a?b=1#c', '!~'])('accepts %j', (value) => {
    expect(hasNonPrintableAscii(value)).toBe(false);
  });
});

describe('hasInvisibleFormatting', () => {
  it.each([
    '\u{ad}',
    '\u{200b}',
    '\u{200f}',
    '\u{202a}',
    '\u{202e}',
    '\u{2028}',
    '\u{2029}',
    '\u{2066}',
    '\u{2069}',
    '\u{feff}',
    '\u{2060}',
    '\u{180e}',
    '\u{34f}',
    '\u{e0041}',
    '\u{61c}',
    '\u{3164}',
    '\u{fff9}',
    '\u{115f}',
    '\u{1160}',
    '\u{ffa0}',
  ])('detects %j', (value) => {
    expect(hasInvisibleFormatting(value)).toBe(true);
  });

  it.each([
    '',
    'Été à Mons — œuvre',
    'Ça va très bien, merci !',
    '😀',
    '\u{2764}\u{fe0f}',
    'a b\n',
  ])('accepts %j', (value) => {
    expect(hasInvisibleFormatting(value)).toBe(false);
  });
});
