import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorks } from '../hooks/useWorks';
import { WorkCard } from '../components/WorkCard';

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

const parseDateString = (dateStr: string): number => {
  if (!dateStr) return 0;
  const parts = dateStr.trim().toLowerCase().split(/\s+/);
  if (parts.length === 2) {
    const [monthStr, yearStr] = parts;
    const month = MONTHS[monthStr] ?? 0;
    const year = parseInt(yearStr, 10) || 0;
    return new Date(year, month, 1).getTime();
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
};

export const Home: React.FC = () => {
  const { works, loading } = useWorks();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const sortedItems = useMemo(() => {
    return [...works].sort((a, b) => {
      const dateDiff = parseDateString(b.date) - parseDateString(a.date);
      if (dateDiff !== 0) return dateDiff;
      const aTime = a.created_at || '';
      const bTime = b.created_at || '';
      return bTime.localeCompare(aTime);
    });
  }, [works]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of container width
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-6 pb-2 w-full text-left">
      {/* Horizontal Slider Content Showcase */}
      <section className="relative pt-1">
        {loading && works.length === 0 ? (
          <div className="text-center py-32 bg-transparent">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-stone-500 animate-pulse font-sans font-light">
              Connecting to database...
            </p>
          </div>
        ) : sortedItems.length > 0 ? (
          <div className="space-y-6">
            {/* Scrollable Gallery Strip */}
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className="flex gap-4 overflow-x-auto select-none pb-4 cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:-mx-8 md:px-8"
            >
              {sortedItems.map((item) => (
                <WorkCard key={item.id} item={item} variant="portrait" />
              ))}
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex justify-end items-center space-x-6 pt-2">
              <Link
                to="/articles"
                className="text-[10px] font-light tracking-[0.2em] uppercase text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white border-b border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white pb-0.5 transition-all font-sans cursor-pointer"
              >
                See All Articles
              </Link>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleScroll('left')}
                  className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-900 hover:border-black dark:hover:border-white text-black dark:text-white flex items-center justify-center transition-colors duration-300 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-900 hover:border-black dark:hover:border-white text-black dark:text-white flex items-center justify-center transition-colors duration-300 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-none bg-transparent">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-stone-500 font-sans font-light">
              No items match your criteria.
            </p>
          </div>
        )}
      </section>

      {/* Typographic Index Signature */}
      <div className="flex items-baseline justify-between w-full pb-2 select-none mt-2">
        <span className="font-sans text-[60px] sm:text-[90px] md:text-[110px] font-light tracking-tighter leading-none text-black dark:text-white">
          01
        </span>
        <span className="font-sans text-[60px] sm:text-[90px] md:text-[110px] font-light tracking-widest leading-none text-black dark:text-white uppercase text-right">
          THE ARCHIVE
        </span>
      </div>
    </div>
  );
};
