import React from 'react';
import { Link } from 'react-router-dom';
import type { WorkItem } from '../data/works';

interface WorkCardProps {
  item: WorkItem;
}

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

export const WorkCard: React.FC<WorkCardProps> = ({ item }) => {
  const hasImage = !!item.imageUrl && item.imageUrl.trim() !== '';

  return (
    <div className="border-b border-neutral-200/70 py-8 first:pt-4 last:border-b-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Left Column: Date */}
        <div className="md:col-span-2 text-left">
          <span className="font-serif text-lg font-bold text-neutral-900 tracking-tight block pt-1">
            {formatDateForDisplay(item.date)}
          </span>
        </div>

        {/* Middle Column: Image */}
        {hasImage && (
          <div className="md:col-span-4 w-full">
            <Link 
              to={`/work/${item.id}`} 
              className="block aspect-[4/3] overflow-hidden bg-neutral-100 border border-neutral-200/50 hover:border-neutral-400/80 transition-colors duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover hover:scale-102 transition-transform duration-500 ease-out"
              />
            </Link>
          </div>
        )}

        {/* Right Column: Title, Subtitle, and Read link */}
        <div className={`${hasImage ? 'md:col-span-6' : 'md:col-span-10'} flex flex-col justify-start text-left space-y-3`}>
          <div>
            <Link to={`/work/${item.id}`} className="group inline-block">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 leading-snug group-hover:text-neutral-700 transition-colors">
                {item.title}
              </h3>
            </Link>
            
            <p className={`${hasImage ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-neutral-500 font-sans leading-relaxed font-light mt-2 line-clamp-3`}>
              {item.subtitle}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags && item.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 border border-neutral-200/80 rounded-full px-2 py-0.5"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Action Read button */}
          <div className="pt-2">
            <Link
              to={`/work/${item.id}`}
              className="inline-block text-[11px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-600 hover:border-neutral-600 transition-all font-sans"
            >
              Read
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
