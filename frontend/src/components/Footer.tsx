import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white py-8 mt-12 dark:bg-black transition-colors duration-300">
      <div className="w-full px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
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

