import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { toast } from '@/hooks/use-toast';

const ContactSection = ({ selectedPlan }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to database
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim(),
      });

      if (error) {
        toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: 'destructive' 
      });
      };

      // Send email notification
      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            message: formData.message.trim(),
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll respond within 24 hours.",
      });

      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: 'Something went wrong. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center mb-2">
            <div className="h-px w-12 bg-primary" />
            <h2 className="mx-6 text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
              Get In Touch
            </h2>
            <div className="h-px w-12 bg-primary" />
          </div>
          <p className="text-muted-foreground italic">Let's Create Something Extraordinary</p>
        </div>

        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/255764422305?text=${encodeURIComponent(
                selectedPlan
                  ? `Hello, I’m interested in the ${selectedPlan.name} package priced at ${selectedPlan.price}. I would like to discuss project details and next steps.`
                  : `Hello, I would like to inquire about your services.`
              )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-8 px-6 py-3 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="px-4 py-3 bg-input border border-primary/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-4 py-3 bg-input border border-primary/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="sm:col-span-2 px-4 py-3 bg-input border border-primary/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="sm:col-span-2 px-4 py-3 bg-input border border-primary/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
