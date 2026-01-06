import Header from '@/components/Header';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title="Cookie Policy — Benon Tech & Art"
        description="Cookie policy explaining how Benon Tech & Art uses cookies and manages user preferences."
      />

      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-primary">
            Cookie Policy
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg">
              Last updated: January 2, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                1. What Are Cookies?
              </h2>
              <p>
                Cookies are small text files stored on your device when you visit a website.
                They help websites function properly and provide insights into how visitors
                interact with online services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                2. Types of Cookies We Use
              </h2>

              <p>
                <strong>Essential Cookies:</strong> These cookies are required for the website
                to operate correctly. They enable core functionality such as navigation,
                security, and storing your cookie preferences. These cookies cannot be disabled.
              </p>

              <p>
                <strong>Analytics Cookies (Optional):</strong> These cookies help us understand
                how visitors interact with our website by collecting anonymous usage data.
                Analytics cookies are only activated after you provide consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                3. Managing Cookie Preferences
              </h2>
              <p>
                You can accept, reject, or customize your cookie preferences using the cookie
                consent banner displayed on our website. Your choices are stored locally in
                your browser and can be changed at any time by clearing site data or revisiting
                cookie settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                4. Third-Party Cookies
              </h2>
              <p>
                We use trusted third-party services such as Google Analytics to analyze website
                performance. These third parties process data in accordance with their own
                privacy policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                5. Contact Us
              </h2>
              <p>
                If you have questions about this Cookie Policy, please contact us at:
              </p>
              <p>
                <strong>Benon Tech & Art Company</strong><br />
                Phone: 0764 422 305<br/>
                Email: benontechart@gmail.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
