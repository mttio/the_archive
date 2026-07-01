import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Camera, Activity } from 'lucide-react';

const Github: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Youtube: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Works & Blog', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-stone-50/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Title */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-600 transition-all duration-300">
              The Archive 
              <span className="text-neutral-400 font-normal text-sm ml-1 select-none">by Matteo Berga</span>
            </span>
            </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-neutral-900 border-b border-neutral-900 pb-1'
                    : 'text-neutral-500 hover:text-neutral-900 pb-1 border-b border-transparent'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="hidden md:flex items-center space-x-4 border-l border-neutral-200 pl-6 ml-2">
            <a
              href="https://github.com/mttio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/matteo-berga-7332a52a6/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://www.instagram.com/mtt_brg/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram/Art"
              className="text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              <Camera size={18} />
            </a>
            <a
              href="https://www.strava.com/athletes/118901811"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Strava/Sports"
              className="text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              <Activity size={18} />
            </a>
            <a
              href="https://www.youtube.com/@matteoberga"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              <Youtube size={18} />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-none p-2 text-neutral-500 hover:text-neutral-900 focus:outline-none"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-stone-50 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block text-base font-medium transition-colors ${
                isActive(link.path) ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center space-x-5 pt-4 border-t border-neutral-200">
            <a
              href="https://github.com/mttio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/matteo-berga-7332a52a6/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://www.instagram.com/mtt_brg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Camera size={20} />
            </a>
            <a
              href="https://www.strava.com/athletes/118901811"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Activity size={20} />
            </a>
            <a
              href="https://www.youtube.com/@matteoberga"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
