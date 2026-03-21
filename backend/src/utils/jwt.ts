import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function getJwtSecrets(): { accessSecret: string; refreshSecret: string } {
  const accessSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set');
  }

  return { accessSecret, refreshSecret };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const { accessSecret } = getJwtSecrets();
  return jwt.sign(payload, accessSecret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const { refreshSecret } = getJwtSecrets();
  return jwt.sign(payload, refreshSecret, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const { accessSecret } = getJwtSecrets();
  return jwt.verify(token, accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const { refreshSecret } = getJwtSecrets();
  return jwt.verify(token, refreshSecret) as JwtPayload;
};
