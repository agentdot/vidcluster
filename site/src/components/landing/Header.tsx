import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const WAITLIST_URL = "https://forms.gle/XDLWLci5i9w8jmE29";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Nav is paused for waitlist phase (keep this for later if you want)
  // const navLinks = [
  //   { href: "#how-it-works", label: "How it works" },
  //   { href: "#features", label: "Features" },
  //   { href: "#faq", label: "FAQ" },
  //   { href: "/contact", label: "Contact" },
  // ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">VidCluster</span>
          </Link>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href={WAITLIST_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="gradient" size="sm">
                Join waitlist
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button (opens menu, not the form) */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              {/* Only CTA in mobile menu for now */}
              <a
                href={WAITLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="gradient" size="sm" className="w-full">
                  Join waitlist
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
