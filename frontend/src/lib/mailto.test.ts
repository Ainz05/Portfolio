import { buildMailto, isValidEmail, type MailtoOptions } from './mailto';

const TO = 'florian.test@example.com';

describe('isValidEmail', () => {
  it.each(['a@example.com', 'first.last+tag@sub.example.be', 'a-b_c@ex-ample.org'])(
    'accepts %s',
    (value) => {
      expect(isValidEmail(value)).toBe(true);
    },
  );

  it.each([
    '[TON EMAIL]',
    '[À COMPLÉTER : email]',
    '',
    'no-at-sign.com',
    'a@b',
    'a@b.c',
    '@example.com',
    'a@@example.com',
    'a b@example.com',
    'a@example.com,b@example.com',
    'a@example.com;b@example.com',
    'a@example.com?cc=evil@example.com',
    'a@example.com&bcc=evil@example.com',
    'a@example.com\nBcc: evil@example.com',
    'a@example.com\r\n',
    'a%0Abcc=evil@example.com@example.com',
    'a@example.com%0Acc=evil@example.com',
    '"quoted"@example.com',
    '<a@example.com>',
    '.a@example.com',
    'a.@example.com',
    `${'a'.repeat(250)}@example.com`,
  ])('rejects %j', (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});

describe('buildMailto', () => {
  it('builds a bare link', () => {
    expect(buildMailto({ to: TO })).toBe(`mailto:${TO}`);
  });

  it('encodes the subject with %20, never "+"', () => {
    const url = buildMailto({ to: TO, subject: 'Stage DevOps / IA / MLOps — prise de contact' });
    expect(url).toBe(
      `mailto:${TO}?subject=Stage%20DevOps%20%2F%20IA%20%2F%20MLOps%20%E2%80%94%20prise%20de%20contact`,
    );
    expect(url).not.toContain('+');
  });

  it('encodes body line breaks as CRLF', () => {
    expect(buildMailto({ to: TO, body: 'a\nb\r\nc\rd' })).toBe(
      `mailto:${TO}?body=a%0D%0Ab%0D%0Ac%0D%0Ad`,
    );
  });

  it('emits subject then body', () => {
    expect(buildMailto({ to: TO, subject: 'Hi', body: 'Yo' })).toBe(
      `mailto:${TO}?subject=Hi&body=Yo`,
    );
  });

  it('neutralizes reserved characters in the subject', () => {
    const url = buildMailto({ to: TO, subject: 'a&cc=evil@example.com?bcc=x#y=z' });
    expect(url).toBe(`mailto:${TO}?subject=a%26cc%3Devil%40example.com%3Fbcc%3Dx%23y%3Dz`);
    expect(url?.match(/\?/g)).toHaveLength(1);
    expect(url).not.toMatch(/[&?]b?cc=/);
  });

  it('neutralizes reserved characters in the body', () => {
    expect(buildMailto({ to: TO, body: '&cc=evil@example.com' })).toBe(
      `mailto:${TO}?body=%26cc%3Devil%40example.com`,
    );
  });

  it('keeps an already percent-encoded payload inert by encoding the "%"', () => {
    expect(buildMailto({ to: TO, subject: 'x%0D%0ABcc: evil@example.com' })).toBe(
      `mailto:${TO}?subject=x%250D%250ABcc%3A%20evil%40example.com`,
    );
  });

  it('keeps accents, emoji and valid surrogate pairs', () => {
    expect(buildMailto({ to: TO, subject: 'Été 😀' })).toBe(
      `mailto:${TO}?subject=%C3%89t%C3%A9%20%F0%9F%98%80`,
    );
  });

  it('omits empty parameters', () => {
    expect(buildMailto({ to: TO, subject: '', body: '' })).toBe(`mailto:${TO}`);
  });

  const hostile: readonly (readonly [string, MailtoOptions])[] = [
    ['placeholder address', { to: '[TON EMAIL]' }],
    ['injected cc in address', { to: `${TO}?cc=evil@example.com` }],
    ['CRLF in address', { to: `${TO}\r\nBcc: evil@example.com` }],
    ['LF in subject', { to: TO, subject: 'Hi\nBcc: evil@example.com' }],
    ['CR in subject', { to: TO, subject: 'Hi\rBcc: evil@example.com' }],
    ['control char in subject', { to: TO, subject: 'Hi\u0000' }],
    ['control char in body', { to: TO, body: 'Hi\u0007' }],
    ['lone high surrogate in body', { to: TO, body: '\ud800' }],
    ['lone low surrogate in subject', { to: TO, subject: '\udc00' }],
    ['reversed surrogates', { to: TO, subject: '\udc00\ud800' }],
    ['zero-width space in subject', { to: TO, subject: 'a\u{200b}b' }],
    ['soft hyphen in body', { to: TO, body: 'a\u{ad}b' }],
    ['RTL override in subject', { to: TO, subject: 'a\u{202e}b' }],
    ['line separator in body', { to: TO, body: 'a\u{2028}b' }],
    ['paragraph separator in subject', { to: TO, subject: 'a\u{2029}b' }],
    ['BOM in body', { to: TO, body: '\u{feff}a' }],
    ['bidi isolate in body', { to: TO, body: 'a\u{2066}b' }],
    ['too long subject', { to: TO, subject: 'a'.repeat(201) }],
    ['too long body', { to: TO, body: 'a'.repeat(1501) }],
  ];

  it.each(hostile)('returns null for %s', (_label, options) => {
    expect(buildMailto(options)).toBeNull();
  });

  it('returns null when the final URL exceeds the length bound', () => {
    expect(buildMailto({ to: TO, subject: 'é'.repeat(200), body: 'é'.repeat(1400) })).toBeNull();
  });
});
