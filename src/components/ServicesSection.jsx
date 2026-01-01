import { Monitor, Palette, TrendingUp, PenTool } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const services = [
  {
    icon: Monitor,
    title: 'Web Design & Development',
    description: 'Custom websites that blend stunning visuals with seamless functionality.',
  },
  {
    icon: Palette,
    title: 'Branding & Identity',
    description: 'Strategic brand development that captures your essence and connects with audiences.',
  },
  {
    icon: TrendingUp,
    title: 'Digital Marketing',
    description: 'Data-driven strategies to amplify your online presence and drive growth.',
  },
  {
    icon: PenTool,
    title: 'Fine Art & Portraits',
    description: 'Exquisite hand-crafted portraits and artwork that tell your story.',
  },
];

const ServicesSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="services" className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="h-px w-12 bg-primary" />
            <span className="mx-4 text-primary text-sm tracking-widest">◆</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
              Our Services
            </h2>
            <span className="mx-4 text-primary text-sm tracking-widest">◆</span>
            <div className="h-px w-12 bg-primary" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className={`group text-center p-8 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg hover:border-primary/60 transition-all duration-500 hover:-translate-y-2 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 120 + 200}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 border border-primary rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
