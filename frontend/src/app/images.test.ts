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
