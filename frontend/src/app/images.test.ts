import { hero } from '@/data/hero';
import {
  MAX_PHOTO_BYTES,
  MAX_SCREENSHOT_BYTES,
  decodeDataUrl,
  metadataProblem,
} from './imageMetadata.test-utils';
import { imageUrls } from './images';

/*
 * Checks on the real files in src/assets/images/. Only put final files there, already cleaned
 * (for example with `exiftool -all= <file>`): any EXIF/GPS/XMP/text metadata, an unknown
 * format or an oversized file makes these tests fail.
 */
const inlineFiles = import.meta.glob<string>('../assets/images/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  query: '?inline',
  import: 'default',
});

const bytesByFile = Object.entries(inlineFiles).map(([path, dataUrl]) => ({
  file: path.slice(path.lastIndexOf('/') + 1),
  bytes: decodeDataUrl(dataUrl),
}));

function bytes(values: readonly number[]): Uint8Array {
  return Uint8Array.from(values);
}

function text(value: string): number[] {
  return Array.from(value, (char) => char.charCodeAt(0));
}

function u32(value: number, littleEndian = false): number[] {
  const parts = [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  return littleEndian ? parts.reverse() : parts;
}

function png(chunkType: string): Uint8Array {
  const signature = [0x89, ...text('PNG'), 0x0d, 0x0a, 0x1a, 0x0a];
  const chunk = (type: string) => [...u32(0), ...text(type), ...u32(0)];
  return bytes([...signature, ...chunk('IHDR'), ...chunk(chunkType), ...chunk('IEND')]);
}

function jpeg(marker: number, payload: string): Uint8Array {
  const body = text(payload);
  const length = body.length + 2;
  return bytes([0xff, 0xd8, 0xff, marker, length >> 8, length & 255, ...body, 0xff, 0xda]);
}

function webp(chunkType: string): Uint8Array {
  const chunk = [...text(chunkType), ...u32(2, true), 0, 0];
  return bytes([...text('RIFF'), ...u32(4 + chunk.length, true), ...text('WEBP'), ...chunk]);
}

function avif(content: string): Uint8Array {
  return bytes([...u32(24), ...text('ftypavif'), ...text(content)]);
}

describe('image metadata detection', () => {
  it.each([
    ['PNG without metadata', png('IDAT'), null],
    ['PNG with an eXIf chunk', png('eXIf'), 'PNG chunk eXIf'],
    ['PNG with a tEXt chunk', png('tEXt'), 'PNG chunk tEXt'],
    ['PNG with an iTXt chunk', png('iTXt'), 'PNG chunk iTXt'],
    ['PNG with a zTXt chunk', png('zTXt'), 'PNG chunk zTXt'],
    ['JPEG without metadata', jpeg(0xe0, 'JFIF\0'), null],
    ['JPEG with EXIF', jpeg(0xe1, 'Exif\0\0II*'), 'JPEG EXIF or XMP segment'],
    ['JPEG with XMP', jpeg(0xe1, 'http://ns.adobe.com/xap/1.0/\0'), 'JPEG EXIF or XMP segment'],
    ['JPEG with IPTC', jpeg(0xed, 'Photoshop 3.0\0'), 'JPEG IPTC or comment segment'],
    ['WebP without metadata', webp('VP8 '), null],
    ['WebP with an EXIF chunk', webp('EXIF'), 'WebP chunk EXIF'],
    ['WebP with an XMP chunk', webp('XMP '), 'WebP chunk XMP'],
    ['AVIF without metadata', avif('mdat'), null],
    ['AVIF with an Exif item', avif('infe Exif'), 'AVIF EXIF or XMP item'],
    ['AVIF with XMP', avif('http://ns.adobe.com/xap/1.0/'), 'AVIF EXIF or XMP item'],
    ['unknown bytes', bytes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), 'unrecognized image format'],
  ])('%s', (_label, data, expected) => {
    expect(metadataProblem(data)).toBe(expected);
  });
});

describe('real image files', () => {
  const photoFile = hero.photo?.file;

  it.each(bytesByFile.map(({ file, bytes: data }): [string, Uint8Array] => [file, data]))(
    'has no metadata and a reasonable weight: %s',
    (file, data) => {
      expect(metadataProblem(data)).toBeNull();
      const limit = file === photoFile ? MAX_PHOTO_BYTES : MAX_SCREENSHOT_BYTES;
      expect(data.length).toBeLessThanOrEqual(limit);
    },
  );

  it('loads every file the build exposes', () => {
    expect(bytesByFile.map(({ file }) => file).sort()).toEqual(Object.keys(imageUrls).sort());
  });
});
