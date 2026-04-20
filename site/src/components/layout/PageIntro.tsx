import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type PageIntroProps = {
  label: string;
  title: string;
  description: string;
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  children?: ReactNode;
};

export default function PageIntro({
  label,
  title,
  description,
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  children,
}: PageIntroProps) {
  return (
    <div className={cn("max-w-4xl", className)}>
      <div
        className={cn(
          "text-[11px] uppercase tracking-[0.26em] text-white/38",
          eyebrowClassName,
        )}
      >
        {label}
      </div>

      <h1
        className={cn(
          "mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl sm:leading-[0.96]",
          titleClassName,
        )}
      >
        {title}
      </h1>

      <p
        className={cn(
          "mt-6 max-w-2xl text-lg leading-8 text-white/60",
          descriptionClassName,
        )}
      >
        {description}
      </p>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
