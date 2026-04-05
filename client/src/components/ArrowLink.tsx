import { Link } from "wouter";
import React from "react";

interface ArrowLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Text link with arrow (→) indicator
 * Used for CTAs and action links across pages (except navbar/footer)
 * Matches collection-cards styling: bold weight + unified border-bottom
 */
export function ArrowLink({
  href,
  children,
  className = "",
  onClick,
}: ArrowLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-primary font-bold border-b border-primary/20 pb-1 hover:border-primary transition-all inline-flex items-center gap-1 ${className}`}
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export default ArrowLink;