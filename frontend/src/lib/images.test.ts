import type { ImageRef } from '@/types/image';
import { indexImageUrls, resolveImage } from './images';

const URLS = indexImageUrls({
  '../assets/images/photo.webp': '/assets/photo-abc123.webp',
  '../assets/images/capture.png': '/assets/capture-def456.png',
});

const REF: ImageRef = { file: 'photo.webp', alt: 'Portrait de Florian', width: 800, height: 800 };

describe('indexImageUrls', () => {
  it('indexes the URLs by file name', () => {
    expect(URLS).toEqual({
      'photo.webp': '/assets/photo-abc123.webp',
      'capture.png': '/assets/capture-def456.png',
    });
  });
});

describe('resolveImage', () => {
  it('resolves a declared image to its build URL', () => {
    expect(resolveImage(REF, URLS)).toEqual({
      src: '/assets/photo-abc123.webp',
      alt: 'Portrait de Florian',
      width: 800,
      height: 800,
    });
  });

  it('returns null when nothing is declared', () => {
    expect(resolveImage(undefined, URLS)).toBeNull();
  });

  it.each([
    'missing.webp',
    '../photo.webp',
    'dossier/photo.webp',
    '..photo.webp',
    'photo.svg',
    'photo.webp.exe',
    'toString',
    '__proto__',
    '',
  ])('returns null for the file %j', (file) => {
    expect(resolveImage({ ...REF, file }, URLS)).toBeNull();
  });

  it.each([
    { alt: '' },
    { alt: '   ' },
    { width: 0 },
    { height: -1 },
    { width: 1.5 },
    { height: Number.NaN },
  ])('returns null for the invalid field %j', (override) => {
    expect(resolveImage({ ...REF, ...override }, URLS)).toBeNull();
  });

  it('refuses a URL that is not a local path', () => {
    const urls = indexImageUrls({
      '../assets/images/photo.webp': 'https://evil.example.com/x.webp',
    });
    expect(resolveImage(REF, urls)).toBeNull();
  });
});
