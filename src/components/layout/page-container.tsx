import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section" | "article";
}

export default function PageContainer({
  children,
  className = "",
  as: Component = "div",
}: PageContainerProps) {
  return (
    <Component className={`container-custom w-full flex-grow py-space-6 ${className}`}>
      {children}
    </Component>
  );
}
