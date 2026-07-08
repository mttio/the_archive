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

export const Articles: React.FC = () => {
  const { works, loading } = useWorks();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tags from API or fallback
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

    return [...filtered].sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
  }, [works, selectedFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-2 w-full text-left">
      {/* Navigation Filters & Search Inline Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2 pb-6">
        {/* Category Inline Filters */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-light tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
          <span>Categories:</span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`cursor-pointer transition-colors duration-200 uppercase ${
              selectedFilter === 'all'
                ? 'text-black dark:text-white font-normal'
                : 'text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white font-light'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <React.Fragment key={tag.id}>
              <span className="text-neutral-200 dark:text-neutral-900">/</span>
              <button
                onClick={() => setSelectedFilter(tag.id)}
                className={`cursor-pointer transition-colors duration-200 uppercase ${
                  selectedFilter === tag.id
                    ? 'text-black dark:text-white font-normal'
                    : 'text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white font-light'
                }`}
              >
                {tag.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Minimal Search Line Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute top-2 left-0 text-neutral-400 dark:text-stone-500" size={13} />
          <input
            type="text"
            placeholder="SEARCH ARCHIVE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-none border-0 border-b border-neutral-200 bg-transparent py-1.5 pl-5 pr-4 text-[10px] uppercase tracking-widest text-black placeholder-neutral-400 focus:border-black focus:outline-none focus:ring-0 transition-colors font-sans dark:border-neutral-900 dark:text-white dark:placeholder-neutral-600 dark:focus:border-white font-light"
          />
        </div>
      </div>

      {/* Conventional Grid Layout */}
      <section className="relative pt-2">
        {loading && works.length === 0 ? (
          <div className="text-center py-32 bg-transparent">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-stone-500 animate-pulse font-sans">
              Connecting to database...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-0">
            {filteredItems.map((item) => (
              <div key={item.id} className="break-inside-avoid mb-6">
                <WorkCard item={item} variant="medium" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-none bg-transparent">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-stone-500 font-sans">
              No items match your criteria.
            </p>
          </div>
        )}
      </section>

      {/* Typographic Index Signature */}
      <div className="flex items-baseline justify-between w-full pb-2 select-none mt-2">
        <span className="font-sans text-[60px] sm:text-[90px] md:text-[110px] font-light tracking-tighter leading-none text-black dark:text-white">
          02
        </span>
        <span className="font-sans text-[60px] sm:text-[90px] md:text-[110px] font-light tracking-widest leading-none text-black dark:text-white uppercase text-right">
          ALL ARTICLES
        </span>
      </div>
    </div>
  );
};
