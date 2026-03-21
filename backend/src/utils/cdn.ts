import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Uploads an image file to the configured CDN (Cloudinary) and returns the
 * public URL.  Falls back to copying the file into the public `uploads/`
 * directory and returning a local URL when Cloudinary credentials are absent.
 *
 * @param tempFilePath - Absolute path to the temporary image file.
 * @param filename     - Final filename to use for the public asset.
 */
export async function uploadToCDN(tempFilePath: string, filename: string): Promise<string> {
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflareImagesToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudflareAccountId && cloudflareImagesToken) {
    try {
      return await uploadToCloudflareImages(tempFilePath, filename, cloudflareAccountId, cloudflareImagesToken);
    } catch (err) {
      logger.warn(`Cloudflare Images upload failed, falling back: ${String(err)}`);
    }
  }

  if (cloudName && apiKey && apiSecret) {
    try {
      return await uploadToCloudinary(tempFilePath, filename, cloudName, apiKey, apiSecret);
    } catch (err) {
      logger.warn(`Cloudinary upload failed, falling back: ${String(err)}`);
    }
  }

  return uploadToLocal(tempFilePath, filename);
}

async function uploadToLocal(tempFilePath: string, filename: string): Promise<string> {
  const publicDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const destPath = path.join(publicDir, filename);
  fs.copyFileSync(tempFilePath, destPath);

  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${filename}`;
}

interface CloudflareUploadResponse {
  success: boolean;
  errors?: Array<{ message?: string }>;
  result?: { variants?: string[] };
}

async function uploadToCloudflareImages(
  filePath: string,
  filename: string,
  accountId: string,
  apiToken: string,
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), filename);
  formData.append('metadata', JSON.stringify({ source: '3r-elite', filename }));

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: formData,
  });

  const body = (await response.json()) as CloudflareUploadResponse;
  if (!response.ok || !body.success) {
    const message = body.errors?.[0]?.message || JSON.stringify(body);
    throw new Error(`Cloudflare Images upload failed (${response.status}): ${message}`);
  }

  const firstVariant = body.result?.variants?.[0];
  if (!firstVariant) {
    throw new Error('Cloudflare Images upload succeeded but no variant URL was returned');
  }

  return firstVariant;
}

async function uploadToCloudinary(
  filePath: string,
  filename: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = path.parse(filename).name; // UUID (no extension)

  // Build signature: sort params alphabetically, append the API secret.
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]));
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
  }

  const result = await response.json() as { secure_url: string };
  return result.secure_url;
}
