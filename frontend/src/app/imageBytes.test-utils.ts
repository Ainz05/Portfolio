// Byte helpers shared by the image metadata checks. Not imported by the application.

const latin1 = new TextDecoder('latin1');

export function ascii(bytes: Uint8Array, start: number, length: number): string {
  return latin1.decode(bytes.subarray(start, start + length));
}

export function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

// Second layer, whatever the format: markers of EXIF, XMP, multi-picture, content credentials
// (C2PA/JUMBF) and Photoshop data. A false positive in compressed data is possible but very
// unlikely, and it fails closed (the file is refused).
const FORBIDDEN_SIGNATURES = [
  'Exif\0\0',
  'adobe:ns:meta',
  '<x:xmpmeta',
  '<?xpacket',
  'ns.adobe.com/xap',
  'MPF\0',
  'jumb',
  'c2pa',
  'caBX',
  'Photoshop 3.0',
];

export function signatureProblem(bytes: Uint8Array): string | null {
  const text = latin1.decode(bytes);
  const found = FORBIDDEN_SIGNATURES.find((signature) => text.includes(signature));
  return found === undefined ? null : `forbidden signature ${JSON.stringify(found)}`;
}
