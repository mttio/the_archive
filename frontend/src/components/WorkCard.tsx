import React from 'react';
import { Link } from 'react-router-dom';
import type { WorkItem } from '../data/works';
import { getResponsiveImageProps } from '../utils/responsiveImage';

interface WorkCardProps {
  item: WorkItem;
  variant?: 'featured' | 'medium' | 'small' | 'sidebar';
}

const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  // Check for YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC'
    }).toUpperCase();
  }
  return dateStr.toUpperCase();
};

export const WorkCard: React.FC<WorkCardProps> = ({ item, variant = 'medium' }) => {
  const hasImage = !!item.imageUrl && item.imageUrl.trim() !== '';
  const formattedDate = formatDateForDisplay(item.date);

  // Metadata section rendering (Date / BY MATTEO BERGA / Tags)
  const renderMetadata = () => (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[9px] font-medium tracking-widest text-neutral-400 uppercase font-sans">
      <span>{formattedDate}</span>
      <span>/</span>
      <span>BY MATTEO BERGA</span>
      {item.tags && item.tags.length > 0 && (
        <>
          <span>/</span>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className="border border-neutral-300/80 dark:border-stone-800 rounded-full px-2.5 py-0.5 text-[8.5px] font-normal text-neutral-400 dark:text-stone-500 uppercase"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (variant === 'featured') {
    return (
      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Left: Info */}
          <div className="md:col-span-6 flex flex-col justify-between py-2 text-left">
            <div className="space-y-4">
              {renderMetadata()}
              <Link to={`/work/${item.id}`} className="group block">
                <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-[46px] tracking-tighter text-neutral-900 dark:text-stone-100 leading-[0.98] uppercase group-hover:text-neutral-700 dark:group-hover:text-stone-300 transition-colors duration-300">
                  {item.title}
                </h2>
              </Link>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-stone-400 font-sans leading-relaxed font-light tracking-wide max-w-md mt-4">
                {item.subtitle}
              </p>
            </div>
            
            <div className="pt-6">
              <Link
                to={`/work/${item.id}`}
                className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-stone-100 border-b-2 border-neutral-900 dark:border-stone-100 pb-0.5 hover:text-neutral-500 dark:hover:text-stone-400 hover:border-neutral-500 dark:hover:border-stone-400 transition-all font-sans"
              >
                Read Article
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="md:col-span-6">
            {hasImage ? (
              <Link 
                to={`/work/${item.id}`}
                className="block w-full overflow-hidden bg-neutral-100 dark:bg-stone-900"
              >
                <img
                  {...getResponsiveImageProps(item.imageUrl, "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px")}
                  alt={item.title}
                  loading="eager"
                  className="w-full h-auto hover:scale-101 transition-transform duration-500 ease-out"
                />
              </Link>
            ) : (
              <div className="aspect-[4/3] bg-neutral-100 border border-dashed border-neutral-200/80 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest text-neutral-300">No Image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'medium') {
    return (
      <div className="py-6 text-left">
        {hasImage && (
          <Link 
            to={`/work/${item.id}`}
            className="block w-full overflow-hidden bg-neutral-100 dark:bg-stone-900 mb-4"
          >
            <img
              {...getResponsiveImageProps(item.imageUrl, "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px")}
              alt={item.title}
              loading="lazy"
              className="w-full h-auto hover:scale-101 transition-transform duration-500 ease-out"
            />
          </Link>
        )}
        <div className="space-y-2">
          {renderMetadata()}
          <Link to={`/work/${item.id}`} className="group block">
            <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-neutral-900 dark:text-stone-100 uppercase leading-[1.05] tracking-tight group-hover:text-neutral-700 dark:group-hover:text-stone-300 transition-colors duration-300">
              {item.title}
            </h3>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'small') {
    return (
      <div className="py-4 text-left">
        {hasImage && (
          <Link 
            to={`/work/${item.id}`}
            className="block w-full overflow-hidden bg-neutral-100 dark:bg-stone-900 mb-3"
          >
            <img
              {...getResponsiveImageProps(item.imageUrl, "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px")}
              alt={item.title}
              loading="lazy"
              className="w-full h-auto hover:scale-101 transition-transform duration-500 ease-out"
            />
          </Link>
        )}
        <div className="space-y-2">
          {renderMetadata()}
          <Link to={`/work/${item.id}`} className="group block">
            <h4 className="font-sans font-extrabold text-sm sm:text-base text-neutral-900 dark:text-stone-100 uppercase leading-[1.1] tracking-tight group-hover:text-neutral-700 dark:group-hover:text-stone-300 transition-colors duration-300">
              {item.title}
            </h4>
          </Link>
        </div>
      </div>
    );
  }

  // variant === 'sidebar'
  return (
    <div className="py-2 text-left">
      {hasImage && (
        <Link 
          to={`/work/${item.id}`}
          className="block w-full overflow-hidden bg-neutral-100 dark:bg-stone-900 mb-3"
        >
          <img
            {...getResponsiveImageProps(item.imageUrl, "(max-width: 1024px) 100vw, 300px")}
            alt={item.title}
            loading="lazy"
            className="w-full h-auto hover:scale-101 transition-transform duration-500 ease-out"
          />
        </Link>
      )}
      <div className="space-y-2">
        {renderMetadata()}
        <Link to={`/work/${item.id}`} className="group block">
          <h4 className="font-sans font-extrabold text-[13px] sm:text-sm text-neutral-900 dark:text-stone-100 uppercase leading-[1.15] tracking-tight group-hover:text-neutral-700 dark:group-hover:text-stone-300 transition-colors duration-300">
            {item.title}
          </h4>
        </Link>
      </div>
    </div>
  );
};
