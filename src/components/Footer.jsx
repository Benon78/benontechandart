import { useState } from 'react';
import { Facebook, Instagram, Linkedin, Send } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists in profiles with blog_notifications enabled
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email, blog_notifications')
        .eq('email', email.trim())
        .single();

      if (existingProfile?.blog_notifications) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter.",
        });
      } else {
        // For newsletter signups without an account, store in contact_submissions
        const { error } = await supabase
          .from('contact_submissions')
          .insert({
            name: 'Newsletter Subscriber',
            email: email.trim(),
            message: 'Newsletter subscription request',
          });

        if (error) throw error;

        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
      }

      setEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const quickLinks = [
    { label: 'Blog', href: '/blog', isRoute: true },
    { label: 'Gallery', href: '/gallery', isRoute: true },
    { label: 'Contact', href: 'contact', isRoute: false },
    { label: 'Pricing', href: 'pricing', isRoute: false },
  ];

  return (
    <footer className="py-12 bg-secondary/50 border-t border-primary/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates and insights.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background/50"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send size={18} />
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Benon Tech & Art Company. All Rights Reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/benontechandart"
              target='_blank'
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center border border-primary/30 rounded-full text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/benon_techart?igsh=em9ldzdmNmU5aHo5"
              target='_blank'
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center border border-primary/30 rounded-full text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center border border-primary/30 rounded-full text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
