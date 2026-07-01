import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200 bg-stone-50 py-8">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-neutral-500 font-sans tracking-wide">
          &copy; {currentYear} Matteo Berga. All rights reserved.
        </p>
        <p className="text-xs text-neutral-400 font-sans italic">
          Designed with intention by Matteo Berga
        </p>
      </div>
    </footer>
  );
};
