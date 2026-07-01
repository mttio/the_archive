import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { worksData } from '../data/works';
import type { WorkItem } from '../data/works';
import type { BlockItem } from '../data/blocks';


const WorkCarousel: React.FC<{ slides: { url: string; caption: string }[] }> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!slides || slides.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden border border-neutral-200 bg-neutral-900 group my-8">
      {/* Slides Container */}
      <div className="relative aspect-video w-full flex items-center justify-center">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.url}
              alt={slide.caption || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {slide.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-white text-left z-20">
                <p className="text-sm font-sans font-light tracking-wide">{slide.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/60 text-white rounded-none border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
            aria-label="Previous Slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/60 text-white rounded-none border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
            aria-label="Next Slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </>
      )}

      {/* Indicators / Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

  // Quick regex parser to turn markdown inline styling into React nodes
  const renderRichText = (text: string) => {
    if (!text) return '';
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
    const tokens = text.split(regex);
    
    return tokens.map((token, index) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={index} className="font-semibold text-neutral-900">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={index} className="italic">{token.slice(1, -1)}</em>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return <code key={index} className="font-mono text-sm bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded border border-neutral-200/50">{token.slice(1, -1)}</code>;
      }
      if (token.startsWith('[') && token.includes('](')) {
        const closeBracket = token.indexOf(']');
        const linkText = token.slice(1, closeBracket);
        const url = token.slice(closeBracket + 2, -1);
        return (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-neutral-900 underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-900 transition-colors">
            {linkText}
          </a>
        );
      }
      return token;
    });
  };

  const renderBlocks = (blocks: BlockItem[]) => {
    return blocks.map((block) => {
      switch (block.type) {
        case 'heading': {
          const Tag = block.level === 2 ? 'h2' : 'h3';
          const sizeClass = block.level === 2 
            ? 'text-3xl mt-10 mb-5 font-semibold font-serif text-neutral-900 tracking-tight' 
            : 'text-2xl mt-8 mb-4 font-bold font-serif text-neutral-900 tracking-tight';
          return (
            <Tag key={block.id} className={sizeClass}>
              {block.value}
            </Tag>
          );
        }
        case 'text':
          return (
            <p key={block.id} className="text-neutral-700 leading-relaxed mb-6 text-base sm:text-lg whitespace-pre-line">
              {renderRichText(block.value)}
            </p>
          );
        case 'list': {
          const Tag = block.listType === 'bullet' ? 'ul' : 'ol';
          const listClass = block.listType === 'bullet' 
            ? 'list-disc pl-6 my-5 space-y-2 text-neutral-600' 
            : 'list-decimal pl-6 my-5 space-y-2 text-neutral-600';
          return (
            <Tag key={block.id} className={listClass}>
              {block.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed text-base sm:text-lg">
                  {renderRichText(item)}
                </li>
              ))}
            </Tag>
          );
        }
        case 'image': {
          let layoutClass = 'max-w-2xl mx-auto my-8'; // center
          if (block.layout === 'wide') {
            layoutClass = '-mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16 my-10 max-w-[110%] w-[110%]';
          } else if (block.layout === 'full') {
            layoutClass = '-mx-6 lg:-mx-8 my-12 w-screen max-w-none relative left-1/2 right-1/2 -translate-x-1/2';
          }
          return (
            <figure key={block.id} className={`${layoutClass} border border-neutral-200 bg-neutral-100/50 overflow-hidden`}>
              <img src={block.url} alt={block.caption || 'Article image'} className="w-full h-auto object-cover max-h-[600px]" />
              {block.caption && (
                <figcaption className="text-center text-xs text-neutral-400 font-sans mt-3 px-4 italic">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        case 'carousel':
          return <WorkCarousel key={block.id} slides={block.slides} />;
        default:
          return null;
      }
    });
  };

  const renderLegacyContent = (text: string) => {
    const lines = text.split('\n');
    let inList = false;
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-4 space-y-2 text-neutral-600">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        return;
      }

      if (trimmed.startsWith('### ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-4 space-y-2 text-neutral-600">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        elements.push(
          <h3 key={index} className="font-serif text-2xl font-bold text-neutral-900 mt-8 mb-4 tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(trimmed.replace('- ', ''));
      } else {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-4 space-y-2 text-neutral-600">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        elements.push(
          <p key={index} className="text-neutral-700 leading-relaxed mb-5 text-base sm:text-lg">
            {trimmed}
          </p>
        );
      }
    });

    if (inList) {
      elements.push(
        <ul key={`list-final`} className="list-disc pl-5 my-4 space-y-2 text-neutral-600">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    try {
      const trimmed = text.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const blocks = JSON.parse(trimmed);
        if (Array.isArray(blocks)) {
          return renderBlocks(blocks);
        }
      }
    } catch (e) {
      // Fallback silently if it's plain markdown
    }
    return renderLegacyContent(text);
  };

  const getTagColorClasses = (_color: string) => {
    return 'text-neutral-500 bg-neutral-50 border-neutral-200';
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
                className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-semibold text-neutral-500"
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
        <div className="relative aspect-video w-full overflow-hidden rounded-none border border-neutral-200 bg-neutral-100 shadow-md">
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
