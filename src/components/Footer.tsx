'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

interface FooterProps {
  customization?: any;
}

const Footer = ({ customization }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/icesuper' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/icesuper' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/icesuper' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@icesuper.com' },
  ];

  const footerLinks = {
    Platform: [
      { name: 'Features', href: '/platform/features' },
      { name: 'Pricing', href: '/platform/pricing' },
      { name: 'API Docs', href: '/platform/api' },
      { name: 'Integrations', href: '/platform/integrations' },
    ],
    Resources: [
      { name: 'Blog', href: '/blog' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'Whitepapers', href: '/whitepapers' },
      { name: 'Webinars', href: '/webinars' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Press', href: '/press' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Compliance', href: '/compliance' },
    ],
  };

  return (
    <footer className="bg-ice-black border-t border-ice-yellow/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="text-2xl font-bold text-ice-yellow">
                ICE SUPER
              </div>
            </Link>
            <p className="text-ice-white/70 text-sm mb-6 max-w-sm">
              Leading B2B iGaming platform providing cutting-edge technology solutions for casino operators and affiliates worldwide.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ice-white/60 hover:text-ice-yellow transition-colors duration-300"
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-ice-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-ice-white/70 hover:text-ice-yellow text-sm transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-ice-yellow/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-ice-white/60 text-sm mb-4 md:mb-0">
              © {currentYear} ICE SUPER. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/sitemap"
                className="text-ice-white/60 hover:text-ice-yellow transition-colors duration-300"
              >
                Sitemap
              </Link>
              <Link
                href="/rss"
                className="text-ice-white/60 hover:text-ice-yellow transition-colors duration-300"
              >
                RSS Feed
              </Link>
              <span className="text-ice-white/40">
                Made with ⚡ by ICE SUPER
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
