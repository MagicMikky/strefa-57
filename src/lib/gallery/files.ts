const MAX_BYTES = 5 * 1024 * 1024;

export type ImageKind = "jpg" | "png" | "webp";

export function inspectImage(bytes: Uint8Array): { kind: ImageKind; width: number; height: number } | { error: string } {
  if (bytes.byteLength < 16 || bytes.byteLength > MAX_BYTES) {
    return { error: "Zdjęcie musi mieć od kilku bajtów do 5 MB." };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return jpegSize(bytes);
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return pngSize(bytes);
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return webpSize(bytes);
  return { error: "Dozwolone są tylko pliki JPEG, PNG i WebP." };
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function pngSize(bytes: Uint8Array): { kind: "png"; width: number; height: number } | { error: string } {
  if (ascii(bytes, 12, 4) !== "IHDR") return { error: "Plik PNG jest uszkodzony." };
  const width = readUint32(bytes, 16);
  const height = readUint32(bytes, 20);
  if (!validSize(width, height)) return { error: "Wymiary PNG są poza zakresem." };
  return { kind: "png", width, height };
}

function jpegSize(bytes: Uint8Array): { kind: "jpg"; width: number; height: number } | { error: string } {
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) return { error: "Plik JPEG jest uszkodzony." };
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) return { error: "Plik JPEG jest uszkodzony." };
    if (marker >= 0xc0 && marker <= 0xc3) {
      const height = (bytes[offset + 5] << 8) + bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) + bytes[offset + 8];
      if (!validSize(width, height)) return { error: "Wymiary JPEG są poza zakresem." };
      return { kind: "jpg", width, height };
    }
    offset += 2 + length;
  }
  return { error: "Nie udało się odczytać wymiarów JPEG." };
}

function webpSize(bytes: Uint8Array): { kind: "webp"; width: number; height: number } | { error: string } {
  const format = ascii(bytes, 12, 4);
  if (format === "VP8X" && bytes.length >= 30) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    if (!validSize(width, height)) return { error: "Wymiary WebP są poza zakresem." };
    return { kind: "webp", width, height };
  }
  if (format === "VP8 " && bytes.length >= 30) {
    const width = bytes[26] + (bytes[27] << 8);
    const height = bytes[28] + (bytes[29] << 8);
    if (!validSize(width & 0x3fff, height & 0x3fff)) return { error: "Wymiary WebP są poza zakresem." };
    return { kind: "webp", width: width & 0x3fff, height: height & 0x3fff };
  }
  if (format === "VP8L" && bytes.length >= 25) {
    const bits = bytes[21] + (bytes[22] << 8) + (bytes[23] << 16) + (bytes[24] << 24);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    if (!validSize(width, height)) return { error: "Wymiary WebP są poza zakresem." };
    return { kind: "webp", width, height };
  }
  return { error: "Ten wariant WebP nie jest obsługiwany." };
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (bytes[offset] * 2 ** 24) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
}

function validSize(width: number, height: number) {
  return width >= 1 && height >= 1 && width <= 8000 && height <= 8000;
}
