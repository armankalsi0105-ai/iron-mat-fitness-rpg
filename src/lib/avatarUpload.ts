const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const TARGET_MAX_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 512;

export type AvatarUploadErrorCode = 'type' | 'size' | 'read' | 'process';

export class AvatarUploadError extends Error {
  code: AvatarUploadErrorCode;

  constructor(code: AvatarUploadErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function validateAvatarFile(file: File): void {
  if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    throw new AvatarUploadError(
      'type',
      'Use a JPG, PNG, or WebP image.'
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new AvatarUploadError(
      'size',
      'Image must be 5 MB or smaller.'
    );
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new AvatarUploadError('read', 'Could not read that image file.'));
    };
    img.src = url;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality);
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}

/** Read, resize, and compress an avatar for localStorage-friendly data URLs. */
export async function processAvatarUpload(file: File): Promise<string> {
  validateAvatarFile(file);

  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new AvatarUploadError('process', 'Could not process image on this device.');
  }

  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.92;
  let dataUrl = canvasToDataUrl(canvas, quality);

  while (estimateDataUrlBytes(dataUrl) > TARGET_MAX_BYTES && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvasToDataUrl(canvas, quality);
  }

  if (estimateDataUrlBytes(dataUrl) > MAX_FILE_BYTES) {
    throw new AvatarUploadError(
      'size',
      'Image is still too large after compression. Try a smaller photo.'
    );
  }

  return dataUrl;
}

export const AVATAR_ACCEPT = ACCEPTED_TYPES.join(',');
