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

  return (
    <div className="space-y-12 py-12 md:py-20">
      {/* Hero Section */}
      <section className="space-y-6 text-center ">
        <h1 className=" font-serif text-7xl sm:text-8xl lg:text-8xl font-bold tracking-tight text-neutral-900 leading-[1.1] mb-0">
          The Archive
        </h1>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight leading-[1.1] italic text-neutral-400 mb-9">
          by Matteo Berga
        </h2>
        <p className=" text-md sm:text-lg lg:text-lg text-neutral-600 font-sans leading-relaxed">
          My personal, off-grid, creative hub. <br/>An independent, living archive of the things I love.
        </p>
      </section>

      {/* Filtering & Content Section */}
      <section className="space-y-8 pt-4">
        {/* Navigation Filters & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`rounded-none px-4 py-1.5 text-xs font-medium tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedFilter(tag.id)}
                className={`rounded-none px-4 py-1.5 text-xs font-medium tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  selectedFilter === tag.id
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute top-2.5 left-3 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search works or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border border-neutral-200 bg-white py-2 pl-10 pr-4 text-xs text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Grid Showcase */}
        {loading && works.length === 0 ? (
          <div className="text-center py-16 border border-neutral-200 bg-white rounded-none">
            <p className="text-sm text-neutral-500 animate-pulse font-sans">Loading works database...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="flex flex-col">
            {filteredItems.map((item) => (
              <WorkCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-neutral-200 rounded-none bg-white">
            <p className="text-sm text-neutral-400">No items match your criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
};
