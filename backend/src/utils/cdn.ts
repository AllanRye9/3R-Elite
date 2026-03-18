import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Uploads an image file to the configured CDN (Cloudinary) and returns the
 * public URL.  Falls back to copying the file into the public `uploads/`
 * directory and returning a local URL when Cloudinary credentials are absent.
 *
 * @param tempFilePath - Absolute path to the temporary image file.
 * @param filename     - Final filename to use for the public asset.
 */
export async function uploadToCDN(tempFilePath: string, filename: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return uploadToCloudinary(tempFilePath, filename, cloudName, apiKey, apiSecret);
  }

  // Fallback: copy temp file to the public uploads directory.
  const publicDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const destPath = path.join(publicDir, filename);
  fs.copyFileSync(tempFilePath, destPath);

  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${filename}`;
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
