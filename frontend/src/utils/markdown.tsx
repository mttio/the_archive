import React from 'react';
import { WorkCarousel } from '../components/WorkCarousel';

// Parses inline Markdown styles: Bold, Italic, Inline Code, and Link hrefs
function parseInline(text: string): React.ReactNode[] {
  let parts: (string | React.ReactNode)[] = [text];

  // 1. Bold (**text**)
  parts = parts.flatMap(p => {
    if (typeof p !== 'string') return p;
    const split = p.split(/\*\*(.*?)\*\*/g);
    return split.map((chunk, idx) => 
      idx % 2 === 1 ? <strong key={idx} className="font-bold text-neutral-900">{chunk}</strong> : chunk
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
      idx % 2 === 1 ? <code key={idx} className="bg-stone-100 text-neutral-800 px-1 py-0.5 text-[11px] font-mono">{chunk}</code> : chunk
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
          className="underline hover:text-neutral-600 transition-colors"
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
          <ul key={`list-${keyIdx++}`} className="list-disc pl-5 my-4 space-y-2 text-neutral-600 font-sans">
            {itemsReact}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${keyIdx++}`} className="list-decimal pl-5 my-4 space-y-2 text-neutral-600 font-sans">
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
          const layout = params['layout'] || 'center';
          const caption = params['caption'] || '';
          
          let layoutClass = 'max-w-2xl mx-auto my-8'; 
          if (layout === 'wide') {
            layoutClass = '-mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16 my-10 max-w-[110%] w-[110%]';
          } else if (layout === 'full') {
            layoutClass = '-mx-6 lg:-mx-8 my-12 w-screen max-w-none relative left-1/2 -translate-x-1/2';
          }

          elements.push(
            <figure key={`media-${keyIdx++}`} className={`${layoutClass} overflow-hidden`}>
              <img src={mainVal} alt={caption || 'Article image'} className="w-full h-auto object-cover max-h-[600px]" />
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
            <div key={`media-${keyIdx++}`} className="my-8 space-y-3 max-w-3xl mx-auto">
              <div className={`grid gap-4 ${gridCols}`}>
                {urls.map((url, uIdx) => (
                  <div key={uIdx} className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <img src={url} alt={`Collage item ${uIdx + 1}`} className="w-full h-full object-cover" />
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
        <h2 key={`h2-${keyIdx++}`} className="font-serif text-2xl font-bold text-neutral-900 mt-10 mb-4 tracking-tight">
          {parseInline(trimmed.substring(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${keyIdx++}`} className="font-serif text-xl font-bold text-neutral-900 mt-8 mb-4 tracking-tight">
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
      <p key={`p-${keyIdx++}`} className="text-neutral-700 leading-relaxed mb-5 text-base sm:text-lg font-sans">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-4">{elements}</div>;
}
