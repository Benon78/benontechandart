import { useState } from 'react';
import { Check } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import BookingModal from './BookingModal';

const pricingPlans = [
  {
    name: 'Standard',
    price: 'TZS250,000',
    description: 'Starter Web & Art Package',
    features: [
      'Responsive Website Design',
      'Up to 5 Pages',
      'Basic SEO Setup',
      'Contact Form Integration',
      '1 Realistic Digital Portrait',
      '1 Month Technical Support',
    ],
    highlighted: false,
  },
  {
    name: 'Business',
    price: 'TZS650,000',
    description: 'Business Growth & Creative Branding',
    features: [
      'Custom Website Design',
      'Up to 10 Pages',
      'Full SEO Optimization',
      'Brand Identity Package',
      '2 Realistic Portraits (Digital or Pencil)',
      'Social Media Integration',
      '3 Months Technical Support',
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'TZS1,200,000',
    description: 'Executive Creative & Digital Suite',
    features: [
      'Premium Website Design',
      'Unlimited Pages',
      'Advanced SEO & Analytics',
      'Complete Branding Suite',
      '4 Premium Realistic Portraits',
      'Digital Marketing Setup',
      'Priority 6 Months Technical Support',
    ],
    highlighted: false,
  },
];


const PricingSection = ({ setPlan }) => {
   const { ref, isVisible } = useScrollAnimation();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center mb-2">
            <div className="h-px w-12 bg-primary" />
            <h2 className="mx-6 text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
              Pricing Plans
            </h2>
            <div className="h-px w-12 bg-primary" />
          </div>
          <p className="text-muted-foreground italic">Tailored Solutions for You</p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-lg border transition-all duration-500 hover:-translate-y-2 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary/20 to-card border-primary shadow-lg shadow-primary/20'
                  : 'bg-card/50 border-primary/30 hover:border-primary/60'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150 + 200}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-primary text-sm">TZS</span>
                  <span className="text-4xl font-serif font-bold text-gradient-gold">{plan.price.replace('TZS', '')}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>{ setSelectedPlan({ name: plan.name, price: plan.price }); setPlan(plan)}}
                className={`block w-full text-center py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedPlan && (
        <BookingModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          packageName={selectedPlan.name}
          packagePrice={selectedPlan.price}
        />
      )}
    </section>
  );
};

export default PricingSection;
