import { useRouteError } from "react-router-dom";
import Header from '@/components/Header';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';

const ErrorElement = () => {
  const error = useRouteError();

  return (
    <>
     <Seo title="Error — Benon Tech & Art" description="An unexpected error occurred." />
     <Header />
      <section className="section-padding flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-5xl font-heading font-bold text-destructive mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-4">
          Something went wrong while loading this page.
        </p>
        {error?.status && (
          <p className="text-muted-foreground mb-4">
            <strong>Status:</strong> {error.status} {error.statusText || ""}
          </p>
        )}
        {error?.message && (
          <p className="text-muted-foreground mb-4">
            <strong>Message:</strong> {error.message}
          </p>
        )}
        <a
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Go Back Home
        </a>
      </section>
      <Footer />
    </>
  );
};

export default ErrorElement;
