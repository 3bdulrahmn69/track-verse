import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (type === 'verification') {
      // For registration, email should NOT exist
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
    } else if (type === 'reset') {
      // For password reset, email MUST exist
      if (!existingUser) {
        return NextResponse.json(
          { error: 'No account found with this email' },
          { status: 404 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with 10 minutes expiration
    await otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      type,
    });

    // Send email
    const result = await sendOTPEmail({ to: email, otp, type });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
