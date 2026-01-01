import { useState, useEffect } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { toast } from '@/hooks/use-toast';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    rating: 5,
    message: '',
  });

  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching testimonials', description: error.message, variant: 'destructive' });
    }else{
      setTestimonials(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('testimonials').insert({
        name: formData.name.trim(),
        company: formData.company.trim() || null,
        rating: formData.rating,
        message: formData.message.trim(),
      });

      if (error) throw error;

         toast({
        title: "Testimonial Sent!",
        description: "Thank you for your testimonial! It will appear after approval.",
      });
      
      setFormData({ name: '', company: '', rating: 5, message: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            className={`${
              star <= rating
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            } ${
              interactive
                ? 'cursor-pointer hover:scale-110 transition-transform'
                : ''
            }`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <div className="h-px w-12 bg-primary" />
            <h2 className="mx-6 text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
              Client Testimonials
            </h2>
            <div className="h-px w-12 bg-primary" />
          </div>
          <p className="text-muted-foreground italic">
            What Our Clients Say
          </p>
        </div>

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`p-6 bg-card/50 border border-primary/20 rounded-lg transition-all duration-500 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${index * 100 + 200}ms`,
                }}
              >
                {renderStars(testimonial.rating)}
                <p className="text-foreground/90 mt-4 mb-4 italic">
                  "{testimonial.message}"
                </p>
                <div className="border-t border-primary/20 pt-4">
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  {testimonial.company && (
                    <p className="text-sm text-muted-foreground">
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mb-12">
            No testimonials yet. Be the first to share your experience!
          </p>
        )}

        {/* Add Testimonial */}
        <div
          className={`max-w-lg mx-auto transition-all duration-700 delay-400 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Send size={16} />
                Share Your Experience
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 bg-card/50 border border-primary/30 rounded-lg space-y-4"
            >
              <h3 className="text-lg font-serif font-semibold">
                Share Your Experience
              </h3>

              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-4 py-3 bg-input border border-primary/30 rounded-lg"
              />

              <input
                type="text"
                placeholder="Company (optional)"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-4 py-3 bg-input border border-primary/30 rounded-lg"
              />

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Your Rating
                </label>
                {renderStars(formData.rating, true, (r) =>
                  setFormData({ ...formData, rating: r })
                )}
              </div>

              <textarea
                placeholder="Your testimonial..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                rows={4}
                className="w-full px-4 py-3 bg-input border border-primary/30 rounded-lg resize-none"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-primary/50 rounded-full text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isSubmitting
                    ? 'Submitting...'
                    : 'Submit Testimonial'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
