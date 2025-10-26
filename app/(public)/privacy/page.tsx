import type { Metadata } from 'next';
import Link from 'next/link';
import { MdArrowBack } from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Privacy Policy | Track Verse',
  description:
    'Learn how Track Verse collects, uses, and protects your personal information. Read our comprehensive Privacy Policy.',
  keywords: [
    'privacy policy',
    'data protection',
    'user privacy',
    'track verse',
  ],
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
            Last updated: October 26, 2025
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
              At Track Verse, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our service. Please read this policy
              carefully. If you do not agree with the terms of this privacy
              policy, please do not access the service.
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
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Username</li>
                  <li>Date of birth</li>
                  <li>Password (encrypted)</li>
                  <li>Profile picture (if you choose to upload one)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Usage Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We automatically collect certain information about your device
                  and how you interact with our service:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>IP address</li>
                  <li>Pages visited and features used</li>
                  <li>Time and date of visits</li>
                  <li>Movies, shows, games, and books you track</li>
                </ul>
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
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>
                Personalize your experience and provide tailored recommendations
              </li>
              <li>Communicate with you about updates, features, and support</li>
              <li>Analyze usage patterns and trends</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
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
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>With your consent:</strong> When you explicitly agree to
                share information
              </li>
              <li>
                <strong>Service providers:</strong> With third-party vendors who
                help us operate our service
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
              <li>
                <strong>Public information:</strong> Content you choose to make
                public (reviews, ratings, lists)
              </li>
            </ul>
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
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                data
              </li>
              <li>
                <strong>Export:</strong> Download your data in a portable format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing
                communications
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your
              experience, analyze usage patterns, and remember your preferences.
              You can control cookies through your browser settings, but
              disabling cookies may limit your ability to use certain features
              of our service.
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
              className="text-primary hover:text-primary/90 transition-colors"
            >
              View Terms of Service →
            </Link>
            <Link
              href="/register"
              className="text-primary hover:text-primary/90 transition-colors"
            >
              Create an Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
