import { randomBytes, createHash } from 'crypto';

export function generateResetToken(): { token: string; hashedToken: string } {
  // Generate a cryptographically secure random token
  const token = randomBytes(32).toString('hex');
  
  // Hash the token before storing in database
  const hashedToken = createHash('sha256').update(token).digest('hex');
  
  return { token, hashedToken };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateTokenId(): string {
  return `rst_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

export function getTokenExpiration(): string {
  // Token expires in 1 hour
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  return expiresAt.toISOString();
}
