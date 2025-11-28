// Shared OTP store for both send-otp and verify-otp routes
// In production, this should be replaced with Redis or a database

interface OTPData {
  otp: string;
  expiresAt: number;
  type: 'verification' | 'reset';
}

class OTPStore {
  private store: Map<string, OTPData>;

  constructor() {
    this.store = new Map();
    // Cleanup expired OTPs every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set(email: string, data: OTPData): void {
    this.store.set(email, data);
  }

  get(email: string): OTPData | undefined {
    return this.store.get(email);
  }

  delete(email: string): boolean {
    return this.store.delete(email);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [email, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(email);
      }
    }
  }
}

// Export a singleton instance
export const otpStore = new OTPStore();
