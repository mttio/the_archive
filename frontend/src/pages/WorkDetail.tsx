import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { worksData } from '../data/works';
import type { WorkItem } from '../data/works';
import { parseMarkdownToReact } from '../utils/markdown';

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
        <p className="text-sm text-neutral-500 animate-pulse font-sans">Connecting to database console...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-4">Work not found</h2>
        <p className="text-neutral-500 mb-8">The project or article you are looking for does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 rounded-none bg-neutral-900 px-6 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Return Home</span>
        </Link>
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
      });
    }
    return dateStr;
  };

  return (
    <article className="py-12 md:py-20 space-y-12 max-w-4xl mx-auto">
      {/* Header back button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to works</span>
        </button>
        

      </div>

      {/* Intro Metadata */}
      <div className="space-y-4 text-left">
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center space-x-1">
            <Calendar size={12} />
            <span>{formatDateForDisplay(item.date)}</span>
          </span>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags && item.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight font-normal">
          {item.title}
        </h1>
        
        <p className="text-lg sm:text-xl text-neutral-600 font-serif italic font-light max-w-3xl">
          {item.subtitle}
        </p>
      </div>

      {/* Main Showcase Image */}
      {item.imageUrl && item.imageUrl.trim() !== '' && (
        <div className="relative aspect-video w-full overflow-hidden rounded-none bg-neutral-50">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/10 via-transparent to-transparent" />
        </div>
      )}

      {/* Split Content layout */}
      {/* Content body layout */}
      <div className="prose prose-neutral max-w-3xl mx-auto pt-6 text-left">
        {renderContent(item.content)}
      </div>
    </article>
  );
};
