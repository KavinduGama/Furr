'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ClinicNavLink({
  href,
  children,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  badge?: string;
}) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link href={href} className={isActive ? 'active' : ''}>
      <span className="flex items-center gap-3">{children}</span>
      {badge && (
        <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
    </Link>
  );
}
