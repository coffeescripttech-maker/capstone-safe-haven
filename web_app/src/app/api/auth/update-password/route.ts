import { NextRequest, NextResponse } from 'next/server';
import { queryD1 } from '@/lib/d1-client';
import { hashToken } from '@/lib/reset-token';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Hash the token to find it in database
    const hashedToken = hashToken(token);

    // Find and validate token
    const tokenResult = await queryD1(
      `SELECT rt.*, u.id as user_id, u.email
       FROM password_reset_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = ? AND rt.used = 0 AND rt.expires_at > datetime('now')`,
      [hashedToken]
    );

    if (!tokenResult?.results || tokenResult.results.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const tokenData = tokenResult.results[0] as any;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await queryD1(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, tokenData.user_id]
    );

    // Mark token as used
    await queryD1(
      'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      [tokenData.id]
    );

    console.log('Password updated successfully for user:', tokenData.email);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
