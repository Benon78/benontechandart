import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';

// Fallback portfolio items (used if no gallery images are in portfolio)
import portfolioPortrait1 from '@/assets/portfolio-portrait-1.jpg';
import portfolioPortrait2 from '@/assets/portfolio-portrait-2.jpg';
import portfolioWeb1 from '@/assets/portfolio-web-1.jpg';
import portfolioWeb2 from '@/assets/portfolio-web-2.jpg';
import portfolioBranding1 from '@/assets/portfolio-branding-1.jpg';
import portfolioFusion1 from '@/assets/portfolio-fusion-1.jpg';

const fallbackItems = [
  { id: '1', title: 'Elegant Portrait', category: 'Fine Art & Portraits', image: portfolioPortrait1 },
  { id: '2', title: 'Business Website', category: 'Websites & UI', image: portfolioWeb1 },
  { id: '3', title: 'Premium Brand Identity', category: 'Branding & Design', image: portfolioBranding1 },
  { id: '4', title: 'Realistic Portrait', category: 'Fine Art & Portraits', image: portfolioPortrait2 },
  { id: '5', title: 'Art & Technology Fusion', category: 'Digital Art', image: portfolioFusion1 },
  { id: '6', title: 'E-Commerce Platform', category: 'Websites & UI', image: portfolioWeb2 },
];

const PortfolioSection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState(fallbackItems);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    const fetchPortfolioImages = async () => {
      const { data: images } = await supabase
        .from('gallery_images')
        .select('id, title, image_url, category_id, gallery_categories(name)')
        .eq('show_in_portfolio', true)
        .limit(9);

      if (images && images.length > 0) {
        const items = images.map((img) => ({
          id: img.id,
          title: img.title,
          category: img.gallery_categories?.name || 'Uncategorized',
          image: img.image_url,
        }));
        setPortfolioItems(items);
      }
    };

    fetchPortfolioImages();
  }, []);

  return (
    <section id="portfolio" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center mb-2">
            <div className="h-px w-8 bg-primary" />
            <span className="mx-3 text-primary text-xs">◆</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
              Our Portfolio
            </h2>
            <span className="mx-3 text-primary text-xs">◆</span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <p className="text-muted-foreground italic">Explore Our Work</p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.slice(0, 9).map((item, index) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-primary text-sm">{item.category}</p>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-lg transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="max-w-4xl max-h-[80vh] animate-scale-in">
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <h3 className="text-xl font-serif font-semibold text-foreground">{selectedImage.title}</h3>
              <p className="text-primary text-sm">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;
