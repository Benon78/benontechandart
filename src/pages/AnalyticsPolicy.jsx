import Header from '@/components/Header';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';

const AnalyticsPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title="Analytics Policy — Benon Tech & Art"
        description="Analytics policy detailing how Benon Tech & Art uses Google Analytics and processes usage data."
      />

      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-primary">
            Analytics Policy
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg">
              Last updated: January 2, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                1. Analytics Tools We Use
              </h2>
              <p>
                Benon Tech & Art Company uses Google Analytics 4 (GA4) to understand how visitors
                interact with our website and to improve performance, content, and user experience.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                2. Data Collected
              </h2>
              <p>
                When analytics cookies are enabled, we may collect anonymous information such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pages visited and navigation paths</li>
                <li>Session duration and interaction events</li>
                <li>Device type, browser, and operating system</li>
                <li>Approximate geographic location (city-level)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                3. Data We Do Not Collect
              </h2>
              <p>
                We do not collect personal identifiers such as names, email addresses, phone numbers,
                exact locations, or sensitive personal information through analytics tools.
                IP addresses are anonymized before processing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                4. Legal Basis and Consent
              </h2>
              <p>
                Analytics data is processed only after you provide explicit consent through our
                cookie consent mechanism. You may withdraw consent at any time by adjusting your
                cookie preferences.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                5. Data Retention
              </h2>
              <p>
                Analytics data is retained according to Google Analytics retention settings and
                is used solely for internal performance analysis and service improvement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                6. Contact Us
              </h2>
              <p>
                For questions related to analytics or data usage, contact us at:
              </p>
              <p>
                <strong>Benon Tech & Art Company</strong><br />
                Phone: 0764 422 305
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalyticsPolicy;
