import Header from '@/components/Header';
import Seo from '@/components/Seo';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import PricingSection from '@/components/PricingSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { useState } from 'react';

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo title="Benon Tech & Art — Home" description="Benon Tech & Art — creative digital agency blending technology and art. Services, portfolio, blog and contact." />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PortfolioSection />
        <TestimonialsSection />
        <PricingSection setPlan={setSelectedPlan}/>
        <BlogSection />
        <ContactSection selectedPlan = {selectedPlan} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
