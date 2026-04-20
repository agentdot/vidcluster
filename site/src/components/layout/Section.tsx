import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../../lib/utils";
import Container from "./Container";

const spacingClasses = {
  intro: "pb-12 pt-12 lg:pb-16 lg:pt-16",
  standard: "py-16 lg:py-20",
  large: "py-20 lg:py-24",
  none: "",
} as const;

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
  containerClassName?: string;
  bleed?: boolean;
  spacing?: keyof typeof spacingClasses;
};

export default function Section({
  children,
  className = "",
  containerClassName = "",
  bleed = false,
  spacing = "standard",
  ...props
}: SectionProps) {
  const sectionClassName = cn(spacingClasses[spacing], className);

  if (bleed) {
    return (
      <section className={sectionClassName} {...props}>
        {children}
      </section>
    );
  }

  return (
    <section className={sectionClassName} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
