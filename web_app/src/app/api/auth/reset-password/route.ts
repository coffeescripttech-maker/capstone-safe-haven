import { NextRequest, NextResponse } from 'next/server';
import { queryD1 } from '@/lib/d1-client';
import { generateResetToken, generateTokenId, getTokenExpiration } from '@/lib/reset-token';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userResult = await queryD1(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    // Check if user exists
    if (!userResult?.results || userResult.results.length === 0) {
      console.log('Password reset requested for non-existent email:', email);
      
      // In development, show actual error for easier debugging
      // In production, always return success to prevent email enumeration
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          error: 'No account found with this email address. Please check your email or contact your administrator.',
        }, { status: 404 });
      }
      
      // Production: Don't reveal if email exists (security)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      });
    }

    const user = userResult.results[0] as any;

    // Generate reset token
    const { token, hashedToken } = generateResetToken();
    const tokenId = generateTokenId();
    const expiresAt = getTokenExpiration();

    // Store hashed token in database
    await queryD1(
      `INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [tokenId, user.id, hashedToken, expiresAt]
    );

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - Dubai Filmmaker CMS',
        html: generatePasswordResetEmail(resetUrl, user.name || 'User'),
      });

      console.log('Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Don't reveal email sending failure to user
      // Log it for admin monitoring
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
