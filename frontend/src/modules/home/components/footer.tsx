import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, MapPin } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="relative w-8 h-8 mb-6">
              <Image
                src="/sneho_logo.png"
                alt="Sneho Logo"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Making parenting easier by connecting families with trusted,
              background-checked babysitters through intelligent matching.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-teal-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-teal-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-teal-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links: Parents */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">
              For Parents
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/search" className="hover:text-teal-400 transition">
                  Find a Sitter
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-teal-400 transition"
                >
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-teal-400 transition">
                  Safety Standards
                </Link>
              </li>
              <li>
                <Link
                  href="/success-stories"
                  className="hover:text-teal-400 transition"
                >
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Sitters */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">
              For Sitters
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/apply" className="hover:text-teal-400 transition">
                  Apply for Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/safety-check"
                  className="hover:text-teal-400 transition"
                >
                  Background Check
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="hover:text-teal-400 transition"
                >
                  Sitter Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-teal-400 transition"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-teal-500 mt-1" />
                <span>
                  123 Innovation Drive,
                  <br />
                  Tech City, TC 9000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-teal-500" />
                <a href="mailto:support@sneho.com" className="hover:text-white">
                  support@sneho.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Sneho. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
