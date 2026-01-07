// Email service supporting both Resend and Gmail
// Install: npm install nodemailer
// For Resend: npm install resend

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// Gmail SMTP configuration
async function sendEmailViaGmail({ to, subject, html }: SendEmailParams) {
  try {
    // Use async dynamic import for better Next.js compatibility
    const nodemailerModule = await import('nodemailer');
    const nodemailer = nodemailerModule.default || nodemailerModule;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });

    const mailOptions = {
      from: `"Dubai Filmmaker CMS" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent via Gmail:', info.messageId);
    return info;
  } catch (error) {
    console.error('Gmail send error:', error);
    throw error;
  }
}

// Resend API configuration
async function sendEmailViaResend({ to, subject, html }: SendEmailParams) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@dubaifilmmaker.ae',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      throw new Error('Failed to send email via Resend');
    }

    const data = await response.json();
    console.log('Email sent via Resend:', data);
    return data;
  } catch (error) {
    console.error('Resend send error:', error);
    throw error;
  }
}

// Main email function - switches based on EMAIL_PROVIDER env variable
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const provider = process.env.EMAIL_PROVIDER || 'gmail'; // Default to Gmail

  console.log(`Sending email via ${provider}...`);

  try {
    if (provider === 'gmail') {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD');
      }
      return await sendEmailViaGmail({ to, subject, html });
    } else if (provider === 'resend') {
      return await sendEmailViaResend({ to, subject, html });
    } else {
      throw new Error(`Unknown email provider: ${provider}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function generatePasswordResetEmail(resetUrl: string, userName: string = 'User') {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Dubai Filmmaker CMS</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          
          <p>Hi ${userName},</p>
          
          <p>We received a request to reset your password for your Dubai Filmmaker CMS account. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact your administrator.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            Dubai Filmmaker CMS Team
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Dubai Filmmaker. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
    </html>
  `;
}
