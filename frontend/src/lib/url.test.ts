import { isExternalHttpsUrl, isSafeUrl, sanitizeUrl } from './url';

describe('sanitizeUrl', () => {
  it.each([
    ['https://github.com/florian/projet', 'https://github.com/florian/projet'],
    ['HTTPS://Example.com/a?b=1#c', 'https://example.com/a?b=1#c'],
    ['mailto:contact@example.com', 'mailto:contact@example.com'],
    ['mailto:contact@example.com?subject=Salut', 'mailto:contact@example.com?subject=Salut'],
    ['mailto:a@b.com?subject=Hi%20there&body=Yo', 'mailto:a@b.com?subject=Hi%20there&body=Yo'],
    ['mailto:a%40b.com', 'mailto:a@b.com'],
  ])('accepts %s', (input, expected) => {
    expect(sanitizeUrl(input)).toBe(expected);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)',
    'java\nscript:alert(1)',
    'java\tscript:alert(1)',
    '\u0000javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'blob:https://example.com/uuid',
    'http://example.com',
    'ftp://example.com',
    '//evil.example.com',
    '/relative/path',
    './relative',
    'example.com',
    'https:example.com',
    'https:/example.com',
    'https:///example.com',
    'https:\\\\example.com',
    'https://example.com\\@evil.com',
    'https://user:pass@example.com',
    'https://user@example.com',
    'https://exa mple.com',
    'https://example.com/a b',
    'https://example.com/\n',
    'https://example.com/\u0085',
    'https://',
    'mailto:',
    'mailto: contact@example.com',
    '',
    '   ',
    'not a url',
    'mailto:a@b.com?cc=evil@x.com',
    'mailto:a@b.com&bcc=evil@x.com',
    'mailto:a@b.com?bcc=evil@x.com',
    'mailto:?to=evil@x.com',
    'mailto:a@b.com,evil@x.com',
    'mailto:a@b.com%0D%0ABcc:evil@x.com',
    'mailto:a@b.com?subject=x%0D%0ABcc:evil@x.com',
    'mailto:a@b.com?subject=a&subject=b',
    'mailto:a@b.com?body=a&body=b',
    'mailto:a@b.com?subject=a#frag',
    'mailto:%ZZ@b.com',
    'mailto:javascript:alert(1)',
    'mailto:',
    'https://\u{430}pple.com',
    'https://example.com/\u{200b}',
    'https://example.com/\u{ad}',
    'https://example.com/\u{202e}',
    'https://example.com/\u{2028}',
    'https://example.com/\u{feff}',
    'https://exämple.com',
    'https://[invalid',
    'http://',
  ])('rejects %j', (input) => {
    expect(sanitizeUrl(input)).toBeNull();
  });
});

describe('isSafeUrl', () => {
  it('mirrors sanitizeUrl', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('isExternalHttpsUrl', () => {
  it('is true for https only', () => {
    expect(isExternalHttpsUrl('https://example.com')).toBe(true);
    expect(isExternalHttpsUrl('mailto:contact@example.com')).toBe(false);
    expect(isExternalHttpsUrl('http://example.com')).toBe(false);
  });
});
