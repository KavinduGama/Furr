"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  badge?: string;
}

export function AdminNavLink({ href, children, badge }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`admin-link${isActive ? " active" : ""}`}
    >
      {children}
      {badge && <span className="admin-badge">{badge}</span>}
    </Link>
  );
}
