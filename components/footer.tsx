import Link from 'next/link';
import { CookieConsent } from '@/components/public/cookie-consent';

const footerLinks = [
  { label: 'About', href: '/about' },
  { label: 'Membership', href: '/membership' },
  { label: 'Policy & Advocacy', href: '/policy' },
  { label: 'Events', href: '/events' },
  { label: 'Awards', href: '/awards' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'FAQ', href: '/faq' },
];

export function Footer() {
  return (
    <footer className="bg-nafsma-dark-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo + About */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">NAFSMA</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              National Association of Flood &amp; Stormwater Management Agencies.
              Driving flood and stormwater policy that benefits our communities since 1978.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Stay Connected
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              <p>Washington, DC</p>
              <p>
                <a href="mailto:info@nafsma.org" className="hover:text-white">
                  info@nafsma.org
                </a>
              </p>
              <p>
                <a href="tel:2022898625" className="hover:text-white">
                  (202) 289-8625
                </a>
              </p>
              <div className="pt-2">
                <a
                  href="https://www.linkedin.com/company/nafsma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Newsletter signup placeholder */}
            <div className="mt-6">
              <h5 className="text-sm font-medium text-white mb-2">Newsletter</h5>
              <p className="text-xs text-gray-400">
                Subscribe to NAFSMA updates.
              </p>
              {/* Mailchimp embed will go here */}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} National Association of Flood &amp; Stormwater Management Agencies. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/faq" className="text-xs text-gray-400 hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>
      <CookieConsent />
    </footer>
  );
}
