import type { Metadata } from 'next';
import Link from 'next/link';
import { MdArrowBack, MdCheckCircle, MdArrowForward } from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Privacy Policy | Track Verse - Data Protection & User Privacy',
  description:
    'Learn how Track Verse collects, uses, and protects your personal information. Read our comprehensive Privacy Policy covering movies, TV shows, books, and video games tracking.',
  keywords: [
    'privacy policy',
    'data protection',
    'user privacy',
    'track verse',
    'GDPR',
    'data security',
    'personal information',
  ],
  openGraph: {
    title: 'Privacy Policy | Track Verse',
    description:
      'Understand how we protect your data and respect your privacy on Track Verse',
    url: 'https://track-verse.vercel.app/privacy',
    type: 'website',
  },
  alternates: {
    canonical: 'https://track-verse.vercel.app/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <MdArrowBack className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: November 28, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              At Track Verse, a comprehensive media tracking and social platform
              for movies, TV shows, books, and video games, we take your privacy
              seriously. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our service.
              Please read this policy carefully. If you do not agree with the
              terms of this privacy policy, please do not access the service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Personal Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information that you provide directly to us,
                  including:
                </p>
                <div className="space-y-2 text-muted-foreground mt-2">
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Full name</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Email address</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Username</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Date of birth</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Password (encrypted)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Profile picture (if you choose to upload one)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Usage Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We automatically collect certain information about your device
                  and how you interact with our service, including your tracking
                  activity for movies, TV shows, books, and video games:
                </p>
                <div className="space-y-2 text-muted-foreground mt-2">
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Browser type and version</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Operating system</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>IP address</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Pages visited and features used</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Time and date of visits</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      Movies, shows, books, and games you track and review
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Provide, maintain, and improve our services</span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Create and manage your account</span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  Personalize your experience and provide tailored
                  recommendations based on your tracking history and social
                  connections
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  Communicate with you about updates, features, and support
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Analyze usage patterns and trends</span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  Detect and prevent fraud, abuse, and security issues
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Comply with legal obligations</span>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>With your consent:</strong> When you explicitly agree
                  to share information
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Service providers:</strong> With third-party vendors
                  who help us operate our service
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Legal requirements:</strong> When required by law or
                  to protect our rights
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Business transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Public information:</strong> Content you choose to
                  make public (reviews, ratings, lists, and public profiles)
                </span>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is
              active or as needed to provide you services. If you wish to delete
              your account, please contact us. We may retain certain information
              as required by law or for legitimate business purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Access:</strong> Request a copy of your personal
                  information
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Correction:</strong> Update or correct inaccurate
                  information
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Deletion:</strong> Request deletion of your account
                  and data
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Export:</strong> Download your data in a portable
                  format
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Opt-out:</strong> Unsubscribe from marketing
                  communications
                </span>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your
              experience, analyze usage patterns, and remember your preferences.
              Track Verse integrates with third-party APIs (TMDB, RAWG, Open
              Library) for media data, which may use their own cookies and
              tracking technologies. You can control cookies through your
              browser settings, but disabling cookies may limit your ability to
              use certain features of our service.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you believe we have collected information from a child
              under 13, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your own. By using our service, you consent to the
              transfer of your information to countries that may have different
              data protection laws than your country of residence.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the &quot;Last updated&quot; date. Your
              continued use of the service after changes are posted constitutes
              your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at{' '}
              <a
                href="mailto:privacy@trackverse.com"
                className="text-primary hover:text-primary/90 underline"
              >
                privacy@trackverse.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <Link
              href="/terms"
              className="inline-flex items-center text-primary hover:text-primary/90 transition-colors"
            >
              View Terms of Service
              <MdArrowForward className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center text-primary hover:text-primary/90 transition-colors"
            >
              Create an Account
              <MdArrowForward className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
