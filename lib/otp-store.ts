// OTP store using database for production compatibility
import { db } from '@/lib/db';
import { otps } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

interface OTPData {
  otp: string;
  expiresAt: number;
  type: 'verification' | 'reset';
}

class OTPStore {
  async set(email: string, data: OTPData): Promise<void> {
    // Delete any existing OTPs for this email
    await db.delete(otps).where(eq(otps.email, email));

    // Insert new OTP
    await db.insert(otps).values({
      email,
      otp: data.otp,
      type: data.type,
      expiresAt: new Date(data.expiresAt),
    });
  }

  async get(email: string): Promise<OTPData | undefined> {
    const now = new Date();

    // Get non-expired OTP for this email
    const result = await db
      .select()
      .from(otps)
      .where(and(eq(otps.email, email), gt(otps.expiresAt, now)))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    const otp = result[0];
    return {
      otp: otp.otp,
      expiresAt: otp.expiresAt.getTime(),
      type: otp.type,
    };
  }

  async delete(email: string): Promise<boolean> {
    const result = await db.delete(otps).where(eq(otps.email, email));
    return true;
  }
}

// Export a singleton instance
export const otpStore = new OTPStore();
