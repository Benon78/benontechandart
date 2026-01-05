import Header from '@/components/Header';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo title="Terms of Service — Benon Tech & Art" description="Terms of service for Benon Tech & Art." />
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-primary">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg">
              Last updated: January 2, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the services provided by Benon Tech & Art Company, you agree 
                to be bound by these Terms of Service. If you do not agree to these terms, please 
                do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Services</h2>
              <p>
                Benon Tech & Art Company provides web development, branding, portrait photography, 
                and creative design services. The specific deliverables and timelines will be agreed 
                upon in individual project contracts.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Payment Terms</h2>
              <p>
                Payment terms will be specified in individual project agreements. Unless otherwise 
                stated, a deposit may be required before work begins, with the balance due upon 
                project completion.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Intellectual Property</h2>
              <p>
                Upon full payment, clients receive rights to use the final deliverables as agreed. 
                Benon Tech & Art Company retains the right to display work in portfolios and 
                promotional materials unless otherwise agreed in writing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Revisions and Changes</h2>
              <p>
                The number of revisions included in each package will be specified in the project 
                agreement. Additional revisions may incur extra charges.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Cancellation Policy</h2>
              <p>
                Cancellation terms vary by project type and will be outlined in the project agreement. 
                Deposits may be non-refundable depending on work already completed.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Limitation of Liability</h2>
              <p>
                Benon Tech & Art Company shall not be liable for any indirect, incidental, or 
                consequential damages arising from the use of our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us at benontechart@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
