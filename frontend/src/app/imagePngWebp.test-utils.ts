import { ascii, view } from './imageBytes.test-utils';

const PNG_METADATA_CHUNKS = ['eXIf', 'tEXt', 'iTXt', 'zTXt', 'caBX'];
const WEBP_METADATA_CHUNKS = ['EXIF', 'XMP ', 'C2PA'];
const PNG_SIGNATURE_LENGTH = 8;
const PNG_CHUNK_OVERHEAD = 12; // length, type, CRC
const WEBP_HEADER_LENGTH = 12;

export function pngProblem(bytes: Uint8Array): string | null {
  const data = view(bytes);
  let offset = PNG_SIGNATURE_LENGTH;
  while (offset + PNG_CHUNK_OVERHEAD <= bytes.length) {
    const type = ascii(bytes, offset + 4, 4);
    const end = offset + PNG_CHUNK_OVERHEAD + data.getUint32(offset);
    if (PNG_METADATA_CHUNKS.includes(type)) {
      return `PNG chunk ${type}`;
    }
    if (end > bytes.length) {
      return 'malformed PNG: chunk beyond the end of the file';
    }
    if (type === 'IEND') {
      return end === bytes.length ? null : 'PNG data after IEND';
    }
    offset = end;
  }
  return 'malformed PNG: no IEND chunk';
}

export function webpProblem(bytes: Uint8Array): string | null {
  const data = view(bytes);
  if (data.getUint32(4, true) + 8 !== bytes.length) {
    return 'malformed WebP: inconsistent RIFF size';
  }
  let offset = WEBP_HEADER_LENGTH;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const size = data.getUint32(offset + 4, true);
    if (WEBP_METADATA_CHUNKS.includes(type)) {
      return `WebP chunk ${type.trim()}`;
    }
    offset += 8 + size + (size % 2);
    if (offset > bytes.length) {
      return 'malformed WebP: chunk beyond the end of the file';
    }
  }
  return offset === bytes.length ? null : 'malformed WebP: trailing bytes';
}
