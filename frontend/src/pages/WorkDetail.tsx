import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { worksData } from '../data/works';
import type { WorkItem } from '../data/works';
import { parseMarkdownToReact } from '../utils/markdown';
import { getResponsiveImageProps } from '../utils/responsiveImage';


export const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Scroll to top and fetch data on load
  useEffect(() => {
    window.scrollTo(0, 0);
    
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.fetchWorkById(id);
        setItem(data);
      } catch (err) {
        console.warn('API error fetching single item. Falling back to local static mock data.', err);
        const fallback = worksData.find((w) => w.id === id);
        setItem(fallback || null);
      } finally {
        setLoading(false);
      }
    }
    
    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 animate-pulse font-sans">
          Connecting to database console...
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <h2 className="font-sans font-black text-2xl uppercase tracking-tight text-neutral-900">Work not found</h2>
        <p className="text-sm text-neutral-500 font-sans tracking-wide">
          The project or article you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 rounded-none bg-neutral-900 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={12} />
          <span>Return Home</span>
        </button>
      </div>
    );
  }

  const renderContent = (content: string) => {
    return parseMarkdownToReact(content);
  };

  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        timeZone: 'UTC'
      }).toUpperCase();
    }
    return dateStr.toUpperCase();
  };

  return (
    <article className="py-8 space-y-8 max-w-3xl mx-auto text-left">
      {/* Header back button */}
      <div className="flex justify-between items-center pb-2 editorial-border-b">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 text-[10px] font-bold tracking-widest text-neutral-400 hover:text-neutral-900 dark:text-stone-500 dark:hover:text-stone-100 transition-colors cursor-pointer uppercase font-sans"
        >
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Articles</span>
        </button>
        <span className="text-[9px] font-bold tracking-widest text-neutral-300 dark:text-stone-600 uppercase font-sans">
          Entry Details
        </span>
      </div>

      {/* Intro Metadata */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold tracking-widest text-neutral-400 dark:text-stone-500 uppercase font-sans">
          <span>{formatDateForDisplay(item.date)}</span>
          <span>/</span>
          <span>BY MATTEO BERGA</span>
          {item.tags && item.tags.length > 0 && (
            <>
              <span>/</span>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="border border-neutral-300/80 dark:border-stone-800 rounded-full px-2 py-0.5 text-[8.5px] font-normal text-neutral-400 dark:text-stone-500 uppercase"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        
        <h1 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter text-neutral-900 dark:text-stone-100 leading-none uppercase">
          {item.title}
        </h1>
        
        <p className="text-sm sm:text-base text-neutral-500 dark:text-stone-400 font-sans leading-relaxed tracking-wide font-light max-w-2xl">
          {item.subtitle}
        </p>
      </div>

      {/* Main Showcase Image */}
      {item.imageUrl && item.imageUrl.trim() !== '' && (
        <div className="relative w-full overflow-hidden bg-neutral-100 dark:bg-stone-900">
          <img
            {...getResponsiveImageProps(item.imageUrl, "(max-width: 768px) 100vw, 768px")}
            alt={item.title}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Content body layout */}
      <div className="prose prose-neutral dark:prose-invert max-w-none pt-4 text-left font-serif leading-relaxed text-neutral-700 dark:text-stone-300">
        {renderContent(item.content)}
      </div>
    </article>
  );
};
