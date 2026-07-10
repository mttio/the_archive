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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

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
      
      let matchesDateRange = true;
      const itemTime = parseDateString(item.date);
      if (startDate) {
        const startTime = new Date(startDate).getTime();
        if (itemTime < startTime) matchesDateRange = false;
      }
      if (endDate) {
        const endTime = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1);
        if (itemTime > endTime) matchesDateRange = false;
      }

      return matchesFilter && matchesSearch && matchesDateRange;
    });

    const sorted = [...filtered];
    if (sortBy === 'date-desc') {
      sorted.sort((a, b) => {
        const dateDiff = parseDateString(b.date) - parseDateString(a.date);
        if (dateDiff !== 0) return dateDiff;
        const aTime = a.created_at || '';
        const bTime = b.created_at || '';
        return bTime.localeCompare(aTime);
      });
    } else if (sortBy === 'date-asc') {
      sorted.sort((a, b) => {
        const dateDiff = parseDateString(a.date) - parseDateString(b.date);
        if (dateDiff !== 0) return dateDiff;
        const aTime = a.created_at || '';
        const bTime = b.created_at || '';
        return aTime.localeCompare(bTime);
      });
    } else if (sortBy === 'title-asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    }

    return sorted;
  }, [works, selectedFilter, searchQuery, startDate, endDate, sortBy]);

  return (
    <div className="space-y-6 pb-2 w-full text-left">
      {/* Navigation Filters & Search Inline Header */}
      <div className="border border-neutral-200 dark:border-neutral-900 p-5 space-y-5 rounded-none bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-colors duration-300">
        {/* Row 1: Categories & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Category Inline Filters */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] font-light tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`cursor-pointer transition-colors duration-200 uppercase ${
                selectedFilter === 'all'
                  ? 'text-black dark:text-white font-normal underline decoration-1 underline-offset-4'
                  : 'text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white font-light'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <React.Fragment key={tag.id}>
                <span className="text-neutral-200 dark:text-neutral-800">/</span>
                <button
                  onClick={() => setSelectedFilter(tag.id)}
                  className={`cursor-pointer transition-colors duration-200 uppercase ${
                    selectedFilter === tag.id
                      ? 'text-black dark:text-white font-normal underline decoration-1 underline-offset-4'
                      : 'text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white font-light'
                  }`}
                >
                  {tag.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Minimal Search Line Input */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute top-2.5 left-0 text-neutral-400 dark:text-neutral-500" size={13} />
            <input
              type="text"
              placeholder="SEARCH ARCHIVE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border-0 border-b border-neutral-200 bg-transparent py-2 pl-6 pr-4 text-[10px] uppercase tracking-widest text-black placeholder-neutral-400 focus:border-black focus:outline-none focus:ring-0 transition-colors font-sans dark:border-neutral-900 dark:text-white dark:placeholder-neutral-600 dark:focus:border-white font-light"
            />
          </div>
        </div>

        {/* Row 2: Date Range & Sort Order */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
          {/* Date range inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[9px] font-medium tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">Date Range:</span>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-neutral-450 uppercase tracking-widest font-sans font-light">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-0 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-sans font-light tracking-widest focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 text-black dark:text-white py-0.5"
              />
              <span className="text-[9px] text-neutral-450 uppercase tracking-widest font-sans font-light">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-0 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-sans font-light tracking-widest focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 text-black dark:text-white py-0.5"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[9px] tracking-widest uppercase font-sans text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white underline decoration-1 underline-offset-4 cursor-pointer"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-medium tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-sans font-light tracking-widest focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 text-black dark:text-white py-0.5 cursor-pointer dark:bg-black"
            >
              <option value="date-desc" className="bg-white dark:bg-black text-black dark:text-white">Newest First</option>
              <option value="date-asc" className="bg-white dark:bg-black text-black dark:text-white">Oldest First</option>
              <option value="title-asc" className="bg-white dark:bg-black text-black dark:text-white">Title (A-Z)</option>
              <option value="title-desc" className="bg-white dark:bg-black text-black dark:text-white">Title (Z-A)</option>
            </select>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
            {filteredItems.map((item) => (
              <WorkCard key={item.id} item={item} variant="portrait-fluid" />
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
        <span className="font-sans text-[48px] sm:text-[90px] md:text-[110px] font-light tracking-tighter leading-none text-black dark:text-white">
          02
        </span>
        <span className="font-sans text-[48px] sm:text-[90px] md:text-[110px] font-light tracking-normal sm:tracking-wide md:tracking-widest leading-none text-black dark:text-white uppercase text-right">
          ALL ARTICLES
        </span>
      </div>
    </div>
  );
};
