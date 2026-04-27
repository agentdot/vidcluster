import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Container from "./layout/Container";

const navItems = [
  { label: "Research", href: "/research" },
  { label: "Method", href: "/method" },
  { label: "Pricing", href: "/pricing" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#060708]/72 backdrop-blur-xl">
      <Container className="flex items-center justify-between py-4">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="h-3 w-3 rounded-full bg-white/90" />
          </div>

          <div>
            <div className="text-sm font-medium tracking-[0.28em] text-white/72">
              VIDCLUSTER
            </div>
            <div className="text-xs text-white/42">Topic Intelligence System</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={
                  active
                    ? "text-white/95"
                    : "text-white/56 transition hover:text-white"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white/88 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            Join Early Access
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/88 transition hover:bg-white/[0.05] md:hidden"
        >
          <div className="flex flex-col gap-[4px]">
            <span className="block h-[1.5px] w-4 bg-current" />
            <span className="block h-[1.5px] w-4 bg-current" />
            <span className="block h-[1.5px] w-4 bg-current" />
          </div>
        </button>
      </Container>

      {isOpen && (
        <div className="border-t border-white/8 bg-[#060708]/95 md:hidden">
          <Container className="flex flex-col gap-2 py-4">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={
                    active
                      ? "rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
                      : "rounded-2xl px-4 py-3 text-white/70 transition hover:bg-white/[0.04] hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/signup"
              onClick={() => setIsOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Join Early Access
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
