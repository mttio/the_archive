import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-300/80 bg-stone-50 py-8 mt-12 dark:bg-stone-950 dark:border-stone-800">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-light tracking-[0.2em] uppercase text-neutral-400 dark:text-stone-500 font-sans">
          &copy; {currentYear} Matteo Berga. All rights reserved.
        </p>
        <p className="text-[10px] font-light tracking-[0.2em] uppercase text-neutral-400 dark:text-stone-500 font-sans">
          Designed with intention by Matteo Berga
        </p>
      </div>
    </footer>
  );
};

