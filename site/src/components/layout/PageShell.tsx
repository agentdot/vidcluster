import type { ReactNode } from "react";
import SiteHeader from "../SiteHeader";
import Container from "./Container";
import Footer from "./Footer";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  contained?: boolean;
  backgroundLayers?: ReactNode;
};

export default function PageShell({
  children,
  className = "",
  containerClassName = "",
  contained = false,
  backgroundLayers,
}: PageShellProps) {
  return (
    <div className={`min-h-screen bg-background text-foreground ${className}`}>
      <SiteHeader />

      {backgroundLayers ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {backgroundLayers}
        </div>
      ) : null}

      {contained ? (
        <Container className={`relative z-10 pt-12 lg:pt-16 ${containerClassName}`}>
          {children}
        </Container>
      ) : (
        <main className="relative z-10">{children}</main>
      )}

      <Footer />
    </div>
  );
}