import heroBg from '@/assets/hero-bg.jpeg';

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/50 to-background/30" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8 pt-20">
        <div className="max-w-3xl">
          <h1 className="animate-fade-up text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-tight mb-6">
            <span className="text-foreground">Where </span>
            <span className="text-gradient-gold italic">Art</span>
            <br />
            <span className="text-foreground">Meets </span>
            <span className="text-gradient-gold italic">Technology</span>
          </h1>
          
          <p className="animate-fade-up text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed mb-8 max-w-xl" style={{ animationDelay: '200ms' }}>
            Blending fine art, intelligent design, and cutting-edge digital solutions to build powerful brands and immersive digital experiences.
          </p>

          <button
            // href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="animate-scale-in inline-flex items-center px-8 py-3.5 bg-secondary border border-primary/50 text-foreground rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
            style={{ animationDelay: '400ms' }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
