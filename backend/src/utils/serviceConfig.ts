import { logger } from './logger';

interface ServiceReadiness {
  jwt: {
    ready: boolean;
    missing: string[];
  };
  cdn: {
    cloudflare: boolean;
    cloudinary: boolean;
    localFallback: boolean;
  };
  email: {
    resend: boolean;
    smtp: boolean;
    logFallback: boolean;
  };
}

function missing(keys: string[]): string[] {
  return keys.filter((key) => !process.env[key]);
}

function hasAll(keys: string[]): boolean {
  return missing(keys).length === 0;
}

function hasAny(keys: string[]): boolean {
  return keys.some((key) => !!process.env[key]);
}

function warnPartialConfig(serviceName: string, keys: string[]): void {
  const missingKeys = missing(keys);
  if (missingKeys.length === 0) return;
  if (!hasAny(keys)) return;

  logger.warn(
    `${serviceName} partially configured. Missing: ${missingKeys.join(', ')}. ` +
    'Service will not be used until all required variables are set.'
  );
}

export function validateAndLogServiceConfig(): void {
  const readiness = getServiceReadiness();

  const missingJwt = readiness.jwt.missing;
  if (missingJwt.length > 0) {
    throw new Error(`Missing required environment variables: ${missingJwt.join(', ')}`);
  }

  const cloudflareKeys = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_IMAGES_API_TOKEN'];
  const cloudinaryKeys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const resendKeys = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'];
  const smtpKeys = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];

  warnPartialConfig('Cloudflare Images', cloudflareKeys);
  warnPartialConfig('Cloudinary', cloudinaryKeys);
  warnPartialConfig('Resend', resendKeys);
  warnPartialConfig('SMTP', smtpKeys);

  logger.info(
    `Service config: JWT=ready, CDN=[Cloudflare:${readiness.cdn.cloudflare ? 'on' : 'off'}, ` +
    `Cloudinary:${readiness.cdn.cloudinary ? 'on' : 'off'}, LocalFallback:on], ` +
    `Email=[Resend:${readiness.email.resend ? 'on' : 'off'}, SMTP:${readiness.email.smtp ? 'on' : 'off'}, LogFallback:on]`
  );
}

export function getServiceReadiness(): ServiceReadiness {
  const requiredJwtKeys = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const cloudflareKeys = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_IMAGES_API_TOKEN'];
  const cloudinaryKeys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const resendKeys = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'];
  const smtpKeys = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];

  return {
    jwt: {
      ready: hasAll(requiredJwtKeys),
      missing: missing(requiredJwtKeys),
    },
    cdn: {
      cloudflare: hasAll(cloudflareKeys),
      cloudinary: hasAll(cloudinaryKeys),
      localFallback: true,
    },
    email: {
      resend: hasAll(resendKeys),
      smtp: hasAll(smtpKeys),
      logFallback: true,
    },
  };
}
