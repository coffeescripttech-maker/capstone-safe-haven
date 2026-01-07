import { NextRequest, NextResponse } from 'next/server';
import { queryD1 } from '@/lib/d1-client';
import { hashToken } from '@/lib/reset-token';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', valid: false },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const hashedToken = hashToken(token);

    // Find token in database
    const result = await queryD1(
      `SELECT rt.*, u.email, u.name 
       FROM password_reset_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = ? AND rt.used = 0 AND rt.expires_at > datetime('now')`,
      [hashedToken]
    );

    if (!result?.results || result.results.length === 0) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired reset token',
      });
    }

    const tokenData = result.results[0] as any;

    return NextResponse.json({
      valid: true,
      email: tokenData.email,
      name: tokenData.name,
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify token', valid: false },
      { status: 500 }
    );
  }
}
