// Test helpers: detect personal metadata (EXIF/GPS, XMP, text chunks, C2PA) in image bytes and
// refuse anything malformed. Fails closed. Not imported by the application.
import { ascii, signatureProblem } from './imageBytes.test-utils';
import { jpegProblem } from './imageJpeg.test-utils';
import { pngProblem, webpProblem } from './imagePngWebp.test-utils';

// Maximum weight of a file, so the page stays light (Lighthouse). Raise on purpose if needed.
export const MAX_PHOTO_BYTES = 400 * 1024;
export const MAX_SCREENSHOT_BYTES = 600 * 1024;

/** Decodes the base64 part of a `data:` URL (produced by Vite's `?inline`). */
export function decodeDataUrl(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

// Only real AVIF files (brand "avif" or "avis"): HEIC or MP4 renamed to .avif are refused.
// Metadata items are typed "Exif" or carried as XMP (application/rdf+xml).
function avifProblem(bytes: Uint8Array): string | null {
  if (!['avif', 'avis'].includes(ascii(bytes, 8, 4))) {
    return 'not an AVIF file (ftyp brand)';
  }
  const text = ascii(bytes, 0, bytes.length);
  return text.includes('Exif') || text.includes('application/rdf+xml')
    ? 'AVIF EXIF or XMP item'
    : null;
}

function formatProblem(bytes: Uint8Array): string | null {
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG') {
    return pngProblem(bytes);
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return jpegProblem(bytes);
  }
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    return webpProblem(bytes);
  }
  return ascii(bytes, 4, 4) === 'ftyp' ? avifProblem(bytes) : 'unrecognized image format';
}

/** Returns why an image carries metadata, is malformed or unknown, or null when it is clean. */
export function metadataProblem(bytes: Uint8Array): string | null {
  return formatProblem(bytes) ?? signatureProblem(bytes);
}
