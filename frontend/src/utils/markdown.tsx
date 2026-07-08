import React from 'react';
import { WorkCarousel } from '../components/WorkCarousel';
import { getResponsiveImageProps } from './responsiveImage';


// Parses inline Markdown styles: Bold, Italic, Inline Code, and Link hrefs
function parseInline(text: string): React.ReactNode[] {
  let parts: (string | React.ReactNode)[] = [text];

  // 1. Bold (**text**)
  parts = parts.flatMap(p => {
    if (typeof p !== 'string') return p;
    const split = p.split(/\*\*(.*?)\*\*/g);
    return split.map((chunk, idx) => 
      idx % 2 === 1 ? <strong key={idx} className="font-medium text-neutral-900 dark:text-stone-100">{chunk}</strong> : chunk
    );
  });

  // 2. Italic (*text*)
  parts = parts.flatMap(p => {
    if (typeof p !== 'string') return p;
    const split = p.split(/\*(.*?)\*/g);
    return split.map((chunk, idx) => 
      idx % 2 === 1 ? <em key={idx} className="italic">{chunk}</em> : chunk
    );
  });

  // 3. Inline Code (`code`)
  parts = parts.flatMap(p => {
    if (typeof p !== 'string') return p;
    const split = p.split(/`(.*?)`/g);
    return split.map((chunk, idx) => 
      idx % 2 === 1 ? <code key={idx} className="bg-stone-100 text-neutral-800 dark:bg-stone-900 dark:text-stone-200 px-1 py-0.5 text-[11px] font-mono">{chunk}</code> : chunk
    );
  });

  // 4. Links ([text](url))
  parts = parts.flatMap(p => {
    if (typeof p !== 'string') return p;
    const regex = /\[(.*?)\]\((.*?)\)/g;
    const result: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;
    let keyIdx = 0;
    
    while ((match = regex.exec(p)) !== null) {
      if (match.index > lastIndex) {
        result.push(p.substring(lastIndex, match.index));
      }
      const [_, linkText, linkUrl] = match;
      result.push(
        <a 
          key={`link-${keyIdx++}`} 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline hover:text-neutral-600 dark:hover:text-stone-400 transition-colors"
        >
          {linkText}
        </a>
      );
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < p.length) {
      result.push(p.substring(lastIndex));
    }
    return result;
  });

  return parts;
}

// Parses raw Markdown content to React virtual elements
export function parseMarkdownToReact(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentListItems: string[] = [];
  let currentListType: 'bullet' | 'number' | null = null;
  let keyIdx = 0;

  const flushList = () => {
    if (currentListItems.length > 0 && currentListType) {
      const itemsReact = currentListItems.map((item, idx) => (
        <li key={idx} className="leading-relaxed">
          {parseInline(item)}
        </li>
      ));
      
      if (currentListType === 'bullet') {
        elements.push(
          <ul key={`list-${keyIdx++}`} className="list-disc pl-5 my-4 space-y-2 text-neutral-600 dark:text-stone-400 font-sans">
            {itemsReact}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${keyIdx++}`} className="list-decimal pl-5 my-4 space-y-2 text-neutral-600 dark:text-stone-400 font-sans">
            {itemsReact}
          </ol>
        );
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line separates blocks
    if (!trimmed) {
      flushList();
      continue;
    }

    // Custom media block: ![[type: value | param: value]]
    if (trimmed.startsWith('![[') && trimmed.endsWith(']]')) {
      flushList();
      const inner = trimmed.substring(3, trimmed.length - 2).trim();
      const firstColon = inner.indexOf(':');
      
      if (firstColon !== -1) {
        const type = inner.substring(0, firstColon).trim().toLowerCase();
        const paramStr = inner.substring(firstColon + 1).trim();
        
        const params: Record<string, string> = {};
        const parts = paramStr.split('|');
        const mainVal = parts[0].trim();
        
        for (let j = 1; j < parts.length; j++) {
          const part = parts[j].trim();
          const separatorIdx = part.indexOf(':');
          if (separatorIdx !== -1) {
            const key = part.substring(0, separatorIdx).trim().toLowerCase();
            const val = part.substring(separatorIdx + 1).trim();
            params[key] = val;
          }
        }

        if (type === 'image') {
          const caption = params['caption'] || '';
          
          let layoutClass = 'w-full my-8';

          elements.push(
            <figure key={`media-${keyIdx++}`} className={`${layoutClass} overflow-hidden`}>
              <img {...getResponsiveImageProps(mainVal, "(max-width: 768px) 100vw, 768px")} alt={caption || 'Article image'} className="w-auto max-w-full h-auto max-h-[600px] mx-auto block" />
              {caption && (
                <figcaption className="text-center text-xs text-neutral-400 font-sans mt-3 px-4 italic">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        } else if (type === 'carousel') {
          const urls = mainVal.split(',').map(u => u.trim());
          const captions = (params['captions'] || '').split(',').map(c => c.trim());
          const slides = urls.map((url, uIdx) => ({
            url,
            caption: captions[uIdx] || ''
          }));
          elements.push(
            <WorkCarousel key={`media-${keyIdx++}`} slides={slides} />
          );
        } else if (type === 'collage') {
          const urls = mainVal.split(',').map(u => u.trim());
          const caption = params['caption'] || '';
          const gridCols = urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3';
          
          elements.push(
            <div key={`media-${keyIdx++}`} className="my-8 space-y-3 w-full">
              <div className={`grid gap-4 ${gridCols}`}>
                {urls.map((url, uIdx) => (
                  <div key={uIdx} className="bg-neutral-100 dark:bg-stone-900 overflow-hidden flex items-center justify-center">
                    <img {...getResponsiveImageProps(url, urls.length === 2 ? "(max-width: 768px) 100vw, 384px" : "(max-width: 768px) 100vw, 256px")} alt={`Collage item ${uIdx + 1}`} className="w-full h-auto block" />
                  </div>
                ))}
              </div>
              {caption && (
                <p className="text-center text-xs text-neutral-400 font-sans italic">{caption}</p>
              )}
            </div>
          );
        }
      }
      continue;
    }

    // Headings (H2 / H3)
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${keyIdx++}`} className="font-sans font-light uppercase text-xl sm:text-2xl text-neutral-900 dark:text-stone-100 mt-10 mb-4 tracking-tight">
          {parseInline(trimmed.substring(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${keyIdx++}`} className="font-sans font-light uppercase text-lg sm:text-xl text-neutral-900 dark:text-stone-100 mt-8 mb-4 tracking-tight">
          {parseInline(trimmed.substring(4))}
        </h3>
      );
      continue;
    }

    // Bullet Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentListType && currentListType !== 'bullet') {
        flushList();
      }
      currentListType = 'bullet';
      currentListItems.push(trimmed.substring(2));
      continue;
    }

    // Numbered Lists
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      if (currentListType && currentListType !== 'number') {
        flushList();
      }
      currentListType = 'number';
      currentListItems.push(numMatch[2]);
      continue;
    }

    // Paragraph
    flushList();
    elements.push(
      <p key={`p-${keyIdx++}`} className="text-neutral-700 dark:text-stone-300 leading-relaxed mb-5 text-base sm:text-lg font-sans">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-4">{elements}</div>;
}
