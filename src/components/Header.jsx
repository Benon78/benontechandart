import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// import { User as SupabaseUser } from '@supabase/supabase-js';
import logo from '@/assets/logo.jpeg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchUserAvatar(session.user.id);
          }, 0);
        } else {
          setAvatarUrl(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserAvatar(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserAvatar = async (userId) => {
    try {
      const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();

      if(error) throw error;
      setAvatarUrl(data.avatar_url)
      
      // Check if the avatar exists by making a HEAD request
      // const response = await fetch(data.publicUrl, { method: 'HEAD' });
      // if (response.ok) {
      //   setAvatarUrl(data.publicUrl + '?t=' + Date.now());
      // }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvatarUrl(null);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Gallery', href: '/gallery', isRoute: true },
    { name: 'Blog', href: '/blog', isRoute: true },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href, isRoute) => {
    setIsMobileMenuOpen(false);

    if (isRoute) {
      navigate(href);
      return;
    }

    if (href.startsWith('#') && location.pathname !== '/') {
      navigate('/' + href);
    } else if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button onClick={() => handleNavClick('#home')} className="flex items-center gap-2">
            <img src={logo} alt="Benon Tech & Art Company" className="h-12 w-auto" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className="text-foreground/90 hover:text-primary transition-colors text-sm font-medium tracking-wide"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary/20 hover:border-primary transition-colors">
                    <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2 text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
              >
                Sign Up
              </Link>
            )}
            <button
              onClick={() => handleNavClick('#contact')}
              className="px-6 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Get in Touch
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden bg-background/95 backdrop-blur-md py-6 px-4 border-t border-primary/20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href, link.isRoute)}
                  className="text-left text-foreground/90 hover:text-primary transition-colors text-base font-medium"
                >
                  {link.name}
                </button>
              ))}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="mt-4 inline-flex justify-center items-center gap-2 px-6 py-2.5 border border-primary/50 text-foreground rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-all duration-300"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="inline-flex justify-center items-center gap-2 px-6 py-2.5 border border-destructive text-destructive rounded-full text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="mt-4 inline-flex justify-center px-6 py-2.5 border border-primary/50 text-foreground rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              )}
              <button
                onClick={() => handleNavClick('#contact')}
                className="inline-flex justify-center px-6 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Get in Touch
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
