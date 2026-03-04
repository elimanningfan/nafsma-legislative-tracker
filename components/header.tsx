'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Who We Are', href: '/about' },
      { label: 'Staff', href: '/about/staff' },
      { label: 'Board of Directors', href: '/about/board' },
    ],
  },
  {
    label: 'Membership',
    href: '/membership',
    children: [
      { label: 'Why Join', href: '/membership' },
      { label: 'Apply', href: '/membership/join' },
    ],
  },
  { label: 'Policy & Advocacy', href: '/policy' },
  {
    label: 'Events',
    href: '/events',
    children: [
      { label: 'All Events', href: '/events' },
      { label: 'Annual Meeting 2026', href: '/events/annual-meeting-2026' },
    ],
  },
  { label: 'Resources', href: '/resources' },
  {
    label: 'Awards',
    href: '/awards',
    children: [
      { label: 'Overview', href: '/awards' },
      { label: 'Past Winners', href: '/awards/past-winners' },
      { label: 'Apply', href: '/awards/apply' },
    ],
  },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-nafsma-blue">
              NAFSMA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname.startsWith(item.href)
                      ? 'text-nafsma-blue'
                      : 'text-nafsma-warm-gray hover:text-nafsma-blue hover:bg-nafsma-light-blue'
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute left-0 top-full mt-0 w-48 bg-white rounded-md shadow-lg border py-1 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-nafsma-warm-gray hover:bg-nafsma-light-blue hover:text-nafsma-blue"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side: Member Login + CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-nafsma-teal hover:text-nafsma-blue"
            >
              Member Login
            </Link>
            <Link
              href="/membership/join"
              className="inline-flex items-center px-4 py-2 bg-nafsma-blue text-white text-sm font-medium rounded-md hover:bg-nafsma-dark-navy transition-colors"
            >
              Become a Member
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-nafsma-warm-gray hover:text-nafsma-blue hover:bg-nafsma-light-blue rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-6 py-1.5 text-sm text-gray-500 hover:text-nafsma-blue"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-4 border-t space-y-2">
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-medium text-nafsma-teal"
                onClick={() => setMobileMenuOpen(false)}
              >
                Member Login
              </Link>
              <Link
                href="/membership/join"
                className="block px-3 py-2 bg-nafsma-blue text-white text-sm font-medium rounded-md text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
