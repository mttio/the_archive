import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useWorks } from '../hooks/useWorks';
import { WorkCard } from '../components/WorkCard';
import { api } from '../services/api';
import type { TagItem } from '../data/works';
import { worksData } from '../data/works';

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
  const [tags, setTags] = useState<TagItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tags from API or extract them from local mock data on failure
  useEffect(() => {
    api.fetchTags()
      .then(setTags)
      .catch((err) => {
        console.warn('Backend API disconnected. Loading static tags fallback.', err);
        const extracted = new Map<string, TagItem>();
        worksData.forEach((w) => {
          w.tags.forEach((t) => extracted.set(t.id, t));
        });
        setTags(Array.from(extracted.values()));
      });
  }, []);

  const filteredItems = useMemo(() => {
    const filtered = works.filter((item) => {
      const matchesFilter = selectedFilter === 'all' || item.tags.some(t => t.id === selectedFilter);
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    // Sort descending by date (latest first)
    return [...filtered].sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
  }, [works, selectedFilter, searchQuery]);

  // Partition items for asymmetrical magazine grid layout
  const featuredItem = filteredItems[0];
  const mainColumnItem = filteredItems[1];
  const subColumnItem1 = filteredItems[2];
  const subColumnItem2 = filteredItems[3];

  return (
    <div className="space-y-8 pb-12">
      {/* Newspaper Column Header/Tagline */}
      

      {/* Typographic Hero Title Section */}
      <div className="py-12 md:py-16 text-center editorial-border-b">
        <h1 className="font-sans font-black text-6xl sm:text-7xl md:text-[90px] lg:text-[110px] tracking-tight leading-[0.85] text-neutral-900 dark:text-stone-100 uppercase">
          The Archive
        </h1>
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="w-12 h-[1px] bg-neutral-300 dark:bg-stone-800" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 dark:text-stone-500 uppercase font-sans">
            By Matteo Berga
          </span>
          <span className="w-12 h-[1px] bg-neutral-300 dark:bg-stone-800" />
        </div>
      </div>

      {/* Filtering & Content Section */}
      <section className="space-y-6">
        {/* Navigation Filters & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          {/* Pills - Category filters */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="text-[9px] font-extrabold tracking-widest text-neutral-400 dark:text-stone-500 uppercase font-sans mr-2">
              Filter by Category:
            </span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`rounded-full px-3 py-0.5 text-[8.5px] font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
                selectedFilter === 'all'
                  ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-stone-200 dark:border-stone-200 dark:text-stone-950'
                  : 'text-neutral-400 border-neutral-200 hover:text-neutral-900 hover:bg-neutral-100 dark:border-stone-800 dark:text-stone-500 dark:hover:text-stone-100 dark:hover:bg-stone-900'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedFilter(tag.id)}
                className={`rounded-full px-3 py-0.5 text-[8.5px] font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
                  selectedFilter === tag.id
                    ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-stone-200 dark:border-stone-200 dark:text-stone-950'
                    : 'text-neutral-400 border-neutral-200 hover:text-neutral-900 hover:bg-neutral-100 dark:border-stone-800 dark:text-stone-500 dark:hover:text-stone-100 dark:hover:bg-stone-900'
                }`}
              >
                {tag.name}
              </button>
            )) }
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute top-2 left-3 text-neutral-400 dark:text-stone-500" size={13} />
            <input
              type="text"
              placeholder="Search archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border border-neutral-300 bg-white py-1.5 pl-9 pr-4 text-[10px] uppercase tracking-widest text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-0 transition-colors font-sans dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-600 dark:focus:border-stone-600"
            />
          </div>
        </div>

        {/* Dynamic Grid Showcase */}
        {loading && works.length === 0 ? (
          <div className="text-center py-16 border border-neutral-200 bg-white dark:bg-stone-900 dark:border-stone-800 rounded-none">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-stone-500 animate-pulse font-sans">
              Connecting to database console...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-6">
            
            {/* 1. Top Featured Post */}
            {featuredItem && (
              <WorkCard item={featuredItem} variant="featured" />
            )}

            {/* 2. Lower Grid (Asymmetrical Multi-column) */}
            {filteredItems.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
                
                {/* Left Column (Width 8/12) */}
                <div className="md:col-span-8 space-y-8">
                  {mainColumnItem && (
                    <WorkCard item={mainColumnItem} variant="medium" />
                  )}

                  {(subColumnItem1 || subColumnItem2) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      {subColumnItem1 && (
                        <WorkCard item={subColumnItem1} variant="small" />
                      )}
                      {subColumnItem2 && (
                        <WorkCard item={subColumnItem2} variant="small" />
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column / Sidebar (Width 4/12) */}
                <div className="md:col-span-4">
                  <div className="flex flex-col space-y-2">
                    <div className="pb-2 text-left">
                      
                      
                    </div>
                    {(() => {
                      let itemsForSidebar: typeof works = [];
                      if (filteredItems.length === 3) {
                        itemsForSidebar = [filteredItems[2]];
                      } else if (filteredItems.length === 4) {
                        itemsForSidebar = [filteredItems[3]];
                      } else if (filteredItems.length >= 5) {
                        itemsForSidebar = filteredItems.slice(4);
                      }

                      return itemsForSidebar.map((item) => (
                        <WorkCard key={item.id} item={item} variant="sidebar" />
                      ));
                    })()}
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-neutral-300 dark:border-stone-800 rounded-none bg-white dark:bg-stone-900">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-stone-500 font-sans">
              No items match your criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
