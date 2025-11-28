import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MdArrowBack,
  MdCheckCircle,
  MdClose,
  MdArrowForward,
} from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Terms of Service | Track Verse',
  description:
    'Read the Terms of Service for Track Verse. Learn about your rights and responsibilities when using our entertainment tracking platform.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'track verse',
  ],
};

export default function TermsPage() {
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
            Terms of Service
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
              Welcome to Track Verse, a comprehensive media tracking and social
              platform that allows users to track, review, and share their
              consumption of movies, TV shows, books, and video games. By
              accessing or using our service, you agree to be bound by these
              Terms of Service. Please read them carefully. If you do not agree
              to these terms, please do not use our service.
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Account Terms
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  You must be at least 13 years old to use this service.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  You must provide accurate and complete information when
                  creating your account.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  You are responsible for maintaining the security of your
                  account and password.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  You are responsible for all activities that occur under your
                  account.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  You must not use the service for any illegal or unauthorized
                  purpose.
                </span>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Acceptable Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <MdClose className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  Upload, post, or transmit any content that is unlawful,
                  harmful, or offensive
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdClose className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>Impersonate any person or entity</span>
              </div>
              <div className="flex items-start gap-2">
                <MdClose className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>Harass, abuse, or harm other users</span>
              </div>
              <div className="flex items-start gap-2">
                <MdClose className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  Attempt to gain unauthorized access to the service or other
                  accounts
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdClose className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  Use the service to distribute spam, malware, or viruses
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MdClose className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  Scrape, crawl, or use automated tools to access the service
                </span>
              </div>
            </div>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. User Content
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you post on Track Verse,
              including reviews, ratings, comments, and personal lists. However,
              by posting content, you grant us a worldwide, non-exclusive,
              royalty-free license to use, display, and distribute your content
              in connection with the service. You are responsible for ensuring
              you have the rights to any content you post and that it complies
              with these Terms of Service.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Track Verse service, including its original content, features,
              and functionality, is owned by Track Verse and is protected by
              international copyright, trademark, patent, trade secret, and
              other intellectual property laws. Track Verse integrates with
              third-party APIs including TMDB (The Movie Database), RAWG Video
              Games Database, and Open Library for media data. You may not copy,
              modify, distribute, sell, or lease any part of our services or
              access these APIs directly without our explicit permission.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any
              time, with or without notice, for any violation of these Terms of
              Service. Upon termination, your right to use the service will
              immediately cease. We may also delete your account and all
              associated data.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Disclaimers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Track Verse is provided &quot;as is&quot; without warranties of
              any kind, either express or implied. We do not warrant that the
              service will be uninterrupted, secure, or error-free. We are not
              responsible for any content posted by users or for any loss or
              damage that may result from your use of the service.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Track Verse shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time.
              We will notify users of any material changes via email or through
              the service. Your continued use of the service after such
              modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at{' '}
              <a
                href="mailto:legal@trackverse.com"
                className="text-primary hover:text-primary/90 underline"
              >
                legal@trackverse.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <Link
              href="/privacy"
              className="inline-flex items-center text-primary hover:text-primary/90 transition-colors"
            >
              View Privacy Policy
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
