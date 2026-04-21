import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import SiteHeader from "../SiteHeader";
import Container from "./Container";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  containerClassName?: string;
  backgroundLayers?: ReactNode;
  contained?: boolean;
};

export default function PageShell({
  children,
  className = "",
  mainClassName = "",
  containerClassName = "",
  backgroundLayers,
  contained = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#060708] text-white selection:bg-white/20 selection:text-white",
        className,
      )}
    >
      {backgroundLayers ? (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          {backgroundLayers}
        </div>
      ) : null}

      <SiteHeader />

      <main className={cn("pb-20", mainClassName)}>
        {contained ? (
          <Container className={cn("pt-12 lg:pt-16", containerClassName)}>
            {children}
          </Container>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
