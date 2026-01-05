import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

// Default gallery images
import galleryPortrait1 from '@/assets/gallery-portrait-1.jpg';
import galleryPortrait2 from '@/assets/gallery-portrait-2.jpg';
import galleryPortrait3 from '@/assets/gallery-portrait-3.jpg';
import galleryWeb1 from '@/assets/gallery-web-1.jpg';
import galleryWeb2 from '@/assets/gallery-web-2.jpg';
import galleryWeb3 from '@/assets/gallery-web-3.jpg';
import galleryBranding1 from '@/assets/gallery-branding-1.jpg';
import galleryBranding2 from '@/assets/gallery-branding-2.jpg';
import galleryBranding3 from '@/assets/gallery-branding-3.jpg';

const defaultImages = {
  'fine-art-portraits': [
    { title: 'Distinguished Gentleman Portrait', image: galleryPortrait1 },
    { title: 'Elegant Woman Portrait', image: galleryPortrait2 },
    { title: 'Joyful Child Portrait', image: galleryPortrait3 },
  ],
  'websites-ui': [
    { title: 'Corporate Business Website', image: galleryWeb1 },
    { title: 'E-Commerce Platform', image: galleryWeb2 },
    { title: 'Analytics Dashboard', image: galleryWeb3 },
  ],
  'branding-design': [
    { title: 'Luxury Brand Identity', image: galleryBranding1 },
    { title: 'Corporate Brand Guidelines', image: galleryBranding2 },
    { title: 'Restaurant Branding', image: galleryBranding3 },
  ],
};

const Gallery = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchGalleryImages();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const fetchGalleryImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select(`
        id,
        title,
        description,
        image_url,
        gallery_categories (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const images = data.map((img) => ({
        id: img.id,
        title: img.title,
        description: img.description,
        image_url: img.image_url,
        category_name: img.gallery_categories?.name || '',
        category_slug: img.gallery_categories?.slug || '',
      }));
      setGalleryImages(images);
    }
    setLoading(false);
  };

  // Combine database images with default images
  const getAllImages = () => {
    const dbImages = galleryImages;
    const defaultGalleryImages = [];

    Object.entries(defaultImages).forEach(([slug, images]) => {
      const category = categories.find(c => c.slug === slug);
      images.forEach((img, index) => {
        const exists = dbImages.some(
          dbImg => dbImg.title === img.title && dbImg.category_slug === slug
        );
        if (!exists) {
          defaultGalleryImages.push({
            id: `default-${slug}-${index}`,
            title: img.title,
            description: null,
            image_url: img.image,
            category_name: category?.name || slug,
            category_slug: slug,
          });
        }
      });
    });

    return [...dbImages, ...defaultGalleryImages];
  };

  const filteredImages = getAllImages().filter(
    img => activeCategory === 'all' || img.category_slug === activeCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Gallery — Benon Tech & Art" description="Explore Benon Tech & Art's creative portfolio across photography, web and branding." />
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-2">
              <div className="h-px w-8 bg-primary" />
              <span className="mx-3 text-primary text-xs">◆</span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
                Gallery
              </h1>
              <span className="mx-3 text-primary text-xs">◆</span>
              <div className="h-px w-8 bg-primary" />
            </div>
            <p className="text-muted-foreground italic">
              Explore our creative work across categories
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-primary/50 text-foreground hover:bg-primary/20'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-primary/50 text-foreground hover:bg-primary/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-lg font-serif font-semibold text-foreground mb-1">
                        {image.title}
                      </h3>
                      <p className="text-primary text-sm">{image.category_name}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-lg transition-colors duration-300" />
                </div>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No images found in this category.</p>
            </div>
          )}
        </div>
      </main>

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
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <h3 className="text-xl font-serif font-semibold text-foreground">
                {selectedImage.title}
              </h3>
              <p className="text-primary text-sm">{selectedImage.category_name}</p>
              {selectedImage.description && (
                <p className="text-muted-foreground mt-2">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
