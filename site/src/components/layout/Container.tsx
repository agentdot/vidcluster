import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
