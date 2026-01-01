import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 bg-secondary/50 border-t border-primary/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 Benon Tech & Art Company. All Rights Reserved.
            </p>
          </div>

          {/* Social Icons */}
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
