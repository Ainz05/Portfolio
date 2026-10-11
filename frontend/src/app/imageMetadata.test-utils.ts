// Test helpers: detect personal metadata (EXIF/GPS, XMP, text chunks) in image bytes.
// Not imported by the application.

// Maximum weight of a file, so the page stays light (Lighthouse). Raise on purpose if needed.
export const MAX_PHOTO_BYTES = 400 * 1024;
export const MAX_SCREENSHOT_BYTES = 600 * 1024;

const XMP_NAMESPACE = 'http://ns.adobe.com/xap/1.0/';
const PNG_METADATA_CHUNKS = ['eXIf', 'tEXt', 'iTXt', 'zTXt'];
const WEBP_METADATA_CHUNKS = ['EXIF', 'XMP '];
const PNG_SIGNATURE_LENGTH = 8;

const latin1 = new TextDecoder('latin1');

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return latin1.decode(bytes.subarray(start, start + length));
}

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/** Decodes the base64 part of a `data:` URL (produced by Vite's `?inline`). */
export function decodeDataUrl(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function pngProblem(bytes: Uint8Array): string | null {
  const data = view(bytes);
  let offset = PNG_SIGNATURE_LENGTH;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset + 4, 4);
    if (PNG_METADATA_CHUNKS.includes(type)) {
      return `PNG chunk ${type}`;
    }
    offset += 12 + data.getUint32(offset);
  }
  return null;
}

function jpegProblem(bytes: Uint8Array): string | null {
  const data = view(bytes);
  let offset = 2;
  while (offset + 4 <= bytes.length && data.getUint8(offset) === 0xff) {
    const marker = data.getUint8(offset + 1);
    if (marker === 0xda) {
      return null;
    }
    const start = ascii(bytes, offset + 4, XMP_NAMESPACE.length);
    if (marker === 0xe1 && (start.startsWith('Exif\0\0') || start.startsWith(XMP_NAMESPACE))) {
      return 'JPEG EXIF or XMP segment';
    }
    if (marker === 0xed || marker === 0xfe) {
      return 'JPEG IPTC or comment segment';
    }
    offset += 2 + data.getUint16(offset + 2);
  }
  return null;
}

function webpProblem(bytes: Uint8Array): string | null {
  const data = view(bytes);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    if (WEBP_METADATA_CHUNKS.includes(type)) {
      return `WebP chunk ${type.trim()}`;
    }
    const size = data.getUint32(offset + 4, true);
    offset += 8 + size + (size % 2);
  }
  return null;
}

// ISO boxes: metadata lives in items typed "Exif" or in an XMP item; a text search is enough.
function avifProblem(bytes: Uint8Array): string | null {
  const text = latin1.decode(bytes);
  return text.includes('Exif') || text.includes(XMP_NAMESPACE) ? 'AVIF EXIF or XMP item' : null;
}

/** Returns why an image carries metadata or is not a known format, or null when it is clean. */
export function metadataProblem(bytes: Uint8Array): string | null {
  if (ascii(bytes, 1, 3) === 'PNG') {
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
