import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gradient-gold mb-2">
              About Us
            </h2>
            <p className="text-muted-foreground text-lg italic mb-8">
              Creativity and Innovation Combined
            </p>
          </div>

          {/* Right Column */}
          <div 
            className={`space-y-6 transition-all duration-800 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          >
            <p className="text-foreground/90 text-base lg:text-lg leading-relaxed">
              Benon Tech & Art Company is a multidisciplinary creative studio that merges artistic expression with modern technology. We help brands, businesses, and institutions transform ideas into visually compelling, functional, and scalable digital solutions.
            </p>
            <p className="text-foreground/90 text-base lg:text-lg leading-relaxed">
              Our work sits at the intersection of art and engineering—where aesthetics, strategy, and technology work together to deliver results.
            </p>
            <a
              href="#services"
              className="inline-flex items-center px-6 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Read More
            </a>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className={`flex items-center justify-center mt-16 transition-all duration-800 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="mx-4 w-2 h-2 rotate-45 border border-primary" />
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
