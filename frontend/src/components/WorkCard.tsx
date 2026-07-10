import React from 'react';
import { Link } from 'react-router-dom';
import type { WorkItem } from '../data/works';
import { getResponsiveImageProps } from '../utils/responsiveImage';

interface WorkCardProps {
  item: WorkItem;
  variant?: 'featured' | 'medium' | 'small' | 'sidebar' | 'portrait' | 'portrait-fluid';
}

const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  // Check for YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric',
      timeZone: 'UTC'
    });
  }
  return dateStr;
};

export const WorkCard: React.FC<WorkCardProps> = ({ item, variant = 'medium' }) => {
  const hasImage = !!item.imageUrl && item.imageUrl.trim() !== '';
  const formattedDate = formatDateForDisplay(item.date);

  // Metadata section rendering (Date / BY MATTEO BERGA / Tags)
  const renderMetadata = () => (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[9px] font-medium tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
      {item.tags && item.tags.length > 0 && (
        <>
          <span>{item.tags[0].name}</span>
          <span className="mx-1 text-neutral-200 dark:text-neutral-800">/</span>
        </>
      )}
      <span>{formattedDate}</span>
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
                <h2 className="font-sans font-light text-3xl sm:text-4xl lg:text-[46px] tracking-widest text-black dark:text-white leading-[0.98] uppercase group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors duration-300">
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
                className="inline-block text-[10px] font-light tracking-[0.2em] uppercase text-black dark:text-white border-b border-black dark:border-white pb-0.5 hover:text-neutral-500 dark:hover:text-neutral-400 hover:border-neutral-500 dark:hover:border-neutral-400 transition-all font-sans"
              >
                Read Article
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="md:col-span-6">
            <Link 
              to={`/work/${item.id}`}
              className="block w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-300"
            >
              {hasImage ? (
                <img
                  {...getResponsiveImageProps(item.imageUrl, "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px")}
                  alt={item.title}
                  loading="eager"
                  className="w-full h-full object-cover hover:scale-101 transition-transform duration-500 ease-out"
                />
              ) : null}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'medium') {
    return (
      <div className="py-6 text-left">
        <Link 
          to={`/work/${item.id}`}
          className="block w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-300 mb-4"
        >
          {hasImage ? (
            <img
              {...getResponsiveImageProps(item.imageUrl, "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px")}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-101 transition-transform duration-500 ease-out"
            />
          ) : null}
        </Link>
        <div className="space-y-2">
          {renderMetadata()}
          <Link to={`/work/${item.id}`} className="group block">
            <h3 className="font-sans font-light text-lg sm:text-xl text-black dark:text-white uppercase leading-normal tracking-widest group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors duration-300">
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
        <Link 
          to={`/work/${item.id}`}
          className="block w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-300 mb-3"
        >
          {hasImage ? (
            <img
              {...getResponsiveImageProps(item.imageUrl, "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px")}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-101 transition-transform duration-500 ease-out"
            />
          ) : null}
        </Link>
        <div className="space-y-2">
          {renderMetadata()}
          <Link to={`/work/${item.id}`} className="group block">
            <h4 className="font-sans font-light text-xs sm:text-sm text-black dark:text-white uppercase leading-normal tracking-widest group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors duration-300">
              {item.title}
            </h4>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'portrait' || variant === 'portrait-fluid') {
    const isFluid = variant === 'portrait-fluid';
    return (
      <div className={`${isFluid ? 'w-full py-4' : 'flex-shrink-0 w-[300px] sm:w-[260px] md:w-[260px]'} select-none text-left`}>
        <Link 
          to={`/work/${item.id}`}
          className="block aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-300 mb-3"
        >
          {hasImage ? (
            <img
              {...(isFluid 
                ? getResponsiveImageProps(item.imageUrl, "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px") 
                : { src: item.imageUrl }
              )}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover hover:scale-101 transition-transform duration-500 ease-out"
            />
          ) : null}
        </Link>
        <div className="space-y-1">
          <Link to={`/work/${item.id}`} className="group block">
            <h4 className="font-sans font-light text-sm sm:text-base md:text-lg text-black dark:text-white uppercase leading-tight tracking-widest group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors">
              {item.title}
            </h4>
          </Link>
          {renderMetadata()}
        </div>
      </div>
    );
  }

  // variant === 'sidebar'
  return (
    <div className="py-2 text-left">
      <Link 
        to={`/work/${item.id}`}
        className="block w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-300 mb-3"
      >
        {hasImage ? (
          <img
            {...getResponsiveImageProps(item.imageUrl, "(max-width: 1024px) 100vw, 300px")}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-101 transition-transform duration-500 ease-out"
          />
        ) : null}
      </Link>
      <div className="space-y-2">
        {renderMetadata()}
        <Link to={`/work/${item.id}`} className="group block">
          <h4 className="font-sans font-light text-xs text-black dark:text-white uppercase leading-[1.15] tracking-widest group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors duration-300">
            {item.title}
          </h4>
        </Link>
      </div>
    </div>
  );
};
