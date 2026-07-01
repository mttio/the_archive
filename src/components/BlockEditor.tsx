import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Sliders as CarouselIcon, 
  Heading2, 
  Heading3, 
  Type, 
  List, 
  ListOrdered, 
  ChevronUp,
  ChevronDown,
  X,
  FileImage
} from 'lucide-react';
import type { BlockItem, CarouselSlide, ImageBlock } from '../data/blocks';

interface BlockEditorProps {
  value: string;
  onChange: (newValue: string) => void;
}

// Resizing textarea helper component
const AutoResizeTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className: string;
  placeholder?: string;
}> = ({ value, onChange, className, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} resize-none overflow-hidden h-auto`}
      rows={1}
      placeholder={placeholder}
    />
  );
};

export const BlockEditor: React.FC<BlockEditorProps> = ({ value, onChange }) => {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);

  // Parse initial value
  useEffect(() => {
    const parsed = convertMarkdownToBlocks(value);
    setBlocks(parsed);
  }, [value]);

  // Sync back to parent when blocks state changes
  const updateBlocks = (newBlocks: BlockItem[]) => {
    setBlocks(newBlocks);
    onChange(JSON.stringify(newBlocks));
  };

  // Convert markdown/raw content to block list
  const convertMarkdownToBlocks = (text: string): BlockItem[] => {
    if (!text) return [{ type: 'text', id: Math.random().toString(36).substr(2, 9), value: '' }];
    try {
      const trimmed = text.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    // Parser for legacy/raw text
    const lines = text.split('\n');
    const result: BlockItem[] = [];
    let currentListItems: string[] = [];
    let currentListType: 'bullet' | 'number' | null = null;

    const flushList = () => {
      if (currentListItems.length > 0 && currentListType) {
        result.push({
          type: 'list',
          id: Math.random().toString(36).substr(2, 9),
          listType: currentListType,
          items: [...currentListItems],
        });
        currentListItems = [];
        currentListType = null;
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith('### ')) {
        flushList();
        result.push({
          type: 'heading',
          id: Math.random().toString(36).substr(2, 9),
          level: 3,
          value: trimmed.replace('### ', ''),
        });
      } else if (trimmed.startsWith('- ')) {
        if (currentListType && currentListType !== 'bullet') {
          flushList();
        }
        currentListType = 'bullet';
        currentListItems.push(trimmed.replace('- ', ''));
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (currentListType && currentListType !== 'number') {
          flushList();
        }
        currentListType = 'number';
        currentListItems.push(trimmed.replace(/^\d+\.\s/, ''));
      } else {
        flushList();
        result.push({
          type: 'text',
          id: Math.random().toString(36).substr(2, 9),
          value: trimmed,
        });
      }
    });

    flushList();

    if (result.length === 0) {
      result.push({ type: 'text', id: Math.random().toString(36).substr(2, 9), value: '' });
    }

    return result;
  };

  // Unique ID generator
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Reordering
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[nextIndex];
    newBlocks[nextIndex] = temp;
    updateBlocks(newBlocks);
  };

  // Deletion
  const deleteBlock = (index: number) => {
    if (blocks.length === 1) {
      // Keep at least one empty text block
      updateBlocks([{ type: 'text', id: generateId(), value: '' }]);
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    updateBlocks(newBlocks);
  };

  // Change Block Type
  const changeBlockType = (index: number, newType: 'text' | 'heading-2' | 'heading-3' | 'list-bullet' | 'list-number' | 'image' | 'carousel') => {
    const oldBlock = blocks[index];
    let newBlock: BlockItem;

    const getBaseText = () => {
      if (oldBlock.type === 'text' || oldBlock.type === 'heading') return oldBlock.value;
      if (oldBlock.type === 'list') return oldBlock.items.join('\n');
      return '';
    };

    if (newType === 'text') {
      newBlock = { type: 'text', id: oldBlock.id, value: getBaseText() };
    } else if (newType === 'heading-2') {
      newBlock = { type: 'heading', id: oldBlock.id, level: 2, value: getBaseText() };
    } else if (newType === 'heading-3') {
      newBlock = { type: 'heading', id: oldBlock.id, level: 3, value: getBaseText() };
    } else if (newType === 'list-bullet' || newType === 'list-number') {
      const items = getBaseText().split('\n').filter(i => i.trim() !== '');
      newBlock = { 
        type: 'list', 
        id: oldBlock.id, 
        listType: newType === 'list-bullet' ? 'bullet' : 'number', 
        items: items.length > 0 ? items : ['First list item'] 
      };
    } else if (newType === 'image') {
      newBlock = {
        type: 'image',
        id: oldBlock.id,
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600',
        caption: 'Caption description here...',
        layout: 'center'
      };
    } else {
      newBlock = {
        type: 'carousel',
        id: oldBlock.id,
        slides: [
          { url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600', caption: 'Slide 1 caption' },
          { url: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=600', caption: 'Slide 2 caption' }
        ]
      };
    }

    const newBlocks = [...blocks];
    newBlocks[index] = newBlock;
    updateBlocks(newBlocks);
  };

  // Insertion Menu
  const insertBlock = (index: number, type: BlockItem['type'] | 'heading-2' | 'heading-3' | 'list-bullet' | 'list-number') => {
    let newBlock: BlockItem;
    const id = generateId();

    if (type === 'text') {
      newBlock = { type: 'text', id, value: '' };
    } else if (type === 'heading-2') {
      newBlock = { type: 'heading', id, level: 2, value: '' };
    } else if (type === 'heading-3') {
      newBlock = { type: 'heading', id, level: 3, value: '' };
    } else if (type === 'list-bullet') {
      newBlock = { type: 'list', id, listType: 'bullet', items: ['New list item'] };
    } else if (type === 'list-number') {
      newBlock = { type: 'list', id, listType: 'number', items: ['New list item'] };
    } else if (type === 'image') {
      newBlock = { type: 'image', id, url: '', caption: '', layout: 'center' };
    } else {
      newBlock = { type: 'carousel', id, slides: [] };
    }

    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    updateBlocks(newBlocks);
  };

  // Value updates per block
  const updateBlockValue = (index: number, value: string) => {
    const newBlocks = [...blocks];
    const block = newBlocks[index];
    if (block.type === 'text' || block.type === 'heading') {
      newBlocks[index] = { ...block, value } as BlockItem;
      updateBlocks(newBlocks);
    }
  };

  // Image block property updates
  const updateImageBlock = (index: number, updates: Partial<ImageBlock>) => {
    const newBlocks = [...blocks];
    const block = newBlocks[index];
    if (block.type === 'image') {
      newBlocks[index] = { ...block, ...updates } as BlockItem;
      updateBlocks(newBlocks);
    }
  };

  // List item property updates
  const updateListItem = (blockIndex: number, itemIndex: number, newValue: string) => {
    const newBlocks = [...blocks];
    const block = newBlocks[blockIndex];
    if (block.type === 'list') {
      const newItems = [...block.items];
      newItems[itemIndex] = newValue;
      newBlocks[blockIndex] = { ...block, items: newItems };
      updateBlocks(newBlocks);
    }
  };

  const addListItem = (blockIndex: number) => {
    const newBlocks = [...blocks];
    const block = newBlocks[blockIndex];
    if (block.type === 'list') {
      newBlocks[blockIndex] = { ...block, items: [...block.items, ''] };
      updateBlocks(newBlocks);
    }
  };

  const removeListItem = (blockIndex: number, itemIndex: number) => {
    const newBlocks = [...blocks];
    const block = newBlocks[blockIndex];
    if (block.type === 'list') {
      if (block.items.length === 1) return; // Don't delete last item
      const newItems = block.items.filter((_, idx) => idx !== itemIndex);
      newBlocks[blockIndex] = { ...block, items: newItems };
      updateBlocks(newBlocks);
    }
  };

  // Carousel slide list updates
  const updateCarouselBlock = (index: number, slides: CarouselSlide[]) => {
    const newBlocks = [...blocks];
    const block = newBlocks[index];
    if (block.type === 'carousel') {
      newBlocks[index] = { ...block, slides } as BlockItem;
      updateBlocks(newBlocks);
    }
  };



  return (
    <div className="space-y-1 block-editor font-sans max-w-3xl mx-auto py-4">
      {/* Top Insert Menu */}
      <div className="flex justify-center py-2 opacity-0 hover:opacity-100 transition-opacity">
        <InsertDivider onInsert={(type) => insertBlock(0, type)} />
      </div>

      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div 
            key={block.id} 
            className="relative group/block flex items-start py-2"
          >
            {/* Hover Controls (Select type, Reorder arrows, & Delete button) */}
            <div className="flex items-center space-x-1 opacity-0 group-hover/block:opacity-100 transition-opacity duration-150 mr-3 select-none pt-1">
              <select
                value={block.type === 'heading' ? `heading-${block.level}` : block.type === 'list' ? `list-${block.listType}` : block.type}
                onChange={(e) => changeBlockType(index, e.target.value as any)}
                className="text-[9px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-50 border border-neutral-200 px-1 py-0.5 max-w-[80px] focus:outline-none cursor-pointer"
                title="Change block type"
              >
                <option value="text">Text</option>
                <option value="heading-2">H2</option>
                <option value="heading-3">H3</option>
                <option value="list-bullet">Bullet</option>
                <option value="list-number">Number</option>
                <option value="image">Image</option>
                <option value="carousel">Carousel</option>
              </select>

              <button
                type="button"
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-neutral-100 text-neutral-500 disabled:text-neutral-200 disabled:hover:bg-transparent cursor-pointer rounded-none"
                title="Move block up"
              >
                <ChevronUp size={13} />
              </button>

              <button
                type="button"
                onClick={() => moveBlock(index, 'down')}
                disabled={index === blocks.length - 1}
                className="p-1 hover:bg-neutral-100 text-neutral-500 disabled:text-neutral-200 disabled:hover:bg-transparent cursor-pointer rounded-none"
                title="Move block down"
              >
                <ChevronDown size={13} />
              </button>

              <button
                type="button"
                onClick={() => deleteBlock(index)}
                className="p-1 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer rounded-none"
                title="Delete block"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Block Canvas Area */}
            <div className="flex-grow min-w-0 border-l-2 border-transparent group-hover/block:border-neutral-200/50 pl-3 transition-colors">
              {/* Render Heading Block */}
              {block.type === 'heading' && (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-neutral-300 select-none uppercase font-mono tracking-widest">
                    H{block.level}
                  </span>
                  <AutoResizeTextarea
                    value={block.value}
                    onChange={(val) => updateBlockValue(index, val)}
                    className={`w-full bg-transparent border-0 border-b border-transparent focus:border-neutral-200 focus:outline-none placeholder-neutral-300 font-serif font-semibold text-neutral-900 ${
                      block.level === 2 ? 'text-2xl py-1' : 'text-xl py-0.5'
                    }`}
                    placeholder={`Heading ${block.level}`}
                  />
                </div>
              )}

              {/* Render Text Block */}
              {block.type === 'text' && (
                <AutoResizeTextarea
                  value={block.value}
                  onChange={(val) => updateBlockValue(index, val)}
                  className="w-full bg-transparent border-0 border-b border-transparent focus:border-neutral-200 focus:outline-none text-neutral-800 placeholder-neutral-300 leading-relaxed font-serif text-base sm:text-lg"
                  placeholder="Type article content here... Support inline styling: **bold**, *italic*, `code`, [text](url)"
                />
              )}

              {/* Render List Block */}
              {block.type === 'list' && (
                <div className="space-y-2">
                  {block.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start space-x-2 group/item">
                      <span className="text-neutral-400 font-mono text-sm pt-1 w-4 text-right select-none">
                        {block.listType === 'bullet' ? '•' : `${itemIdx + 1}.`}
                      </span>
                      <AutoResizeTextarea
                        value={item}
                        onChange={(val) => updateListItem(index, itemIdx, val)}
                        className="flex-grow bg-transparent border-0 border-b border-transparent focus:border-neutral-200 focus:outline-none text-neutral-700 placeholder-neutral-300 leading-relaxed text-sm sm:text-base py-0.5"
                        placeholder="List item..."
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(index, itemIdx)}
                        disabled={block.items.length === 1}
                        className="opacity-0 group-hover/item:opacity-100 p-1 text-neutral-300 hover:text-rose-500 disabled:opacity-0 cursor-pointer rounded-none"
                        title="Delete item"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(index)}
                    className="flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors mt-1 pl-6 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Item</span>
                  </button>
                </div>
              )}

              {/* Render Image Block */}
              {block.type === 'image' && (
                <div className="border border-neutral-200 bg-stone-50/50 p-4 space-y-4 rounded-none">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div className="flex items-center space-x-2 text-neutral-700 font-semibold text-xs uppercase tracking-wider">
                      <ImageIcon size={14} />
                      <span>Single Image</span>
                    </div>
                    <div className="flex space-x-1 border border-neutral-200 p-0.5 bg-white">
                      {(['center', 'wide', 'full'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => updateImageBlock(index, { layout: l })}
                          className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 cursor-pointer transition-colors ${
                            block.layout === l
                              ? 'bg-neutral-900 text-white'
                              : 'text-neutral-500 hover:bg-neutral-100'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Image URL</label>
                        <input
                          type="text"
                          value={block.url}
                          onChange={(e) => updateImageBlock(index, { url: e.target.value })}
                          className="w-full text-xs border border-neutral-200 bg-white px-2 py-1.5 focus:border-neutral-400 focus:outline-none"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Caption / Attribution</label>
                        <input
                          type="text"
                          value={block.caption}
                          onChange={(e) => updateImageBlock(index, { caption: e.target.value })}
                          className="w-full text-xs border border-neutral-200 bg-white px-2 py-1.5 focus:border-neutral-400 focus:outline-none font-serif italic"
                          placeholder="Figure 1: Illustration caption..."
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1 border border-neutral-200 bg-stone-100 flex items-center justify-center overflow-hidden aspect-video relative">
                      {block.url ? (
                        <img src={block.url} alt="Thumbnail preview" className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">No Preview</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Render Carousel Block */}
              {block.type === 'carousel' && (
                <div className="border border-neutral-200 bg-stone-50/50 p-4 space-y-4 rounded-none">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div className="flex items-center space-x-2 text-neutral-700 font-semibold text-xs uppercase tracking-wider">
                      <CarouselIcon size={14} />
                      <span>Image Carousel / Slideshow ({block.slides.length} slides)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {block.slides.map((slide, slideIdx) => (
                      <div key={slideIdx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-neutral-100 p-2.5 bg-white shadow-xs">
                        <div className="md:col-span-1 text-center font-mono text-xs font-semibold text-neutral-400">
                          #{slideIdx + 1}
                        </div>
                        <div className="md:col-span-2 aspect-video bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                          {slide.url ? (
                            <img src={slide.url} alt="Slide Preview" className="object-cover w-full h-full" />
                          ) : (
                            <FileImage size={16} className="text-neutral-300" />
                          )}
                        </div>
                        <div className="md:col-span-8 grid grid-cols-1 gap-2">
                          <input
                            type="text"
                            value={slide.url}
                            onChange={(e) => {
                              const newSlides = [...block.slides];
                              newSlides[slideIdx] = { ...slide, url: e.target.value };
                              updateCarouselBlock(index, newSlides);
                            }}
                            className="text-xs border border-neutral-100 bg-stone-50/50 px-2 py-1 focus:border-neutral-300 focus:outline-none"
                            placeholder="Image URL"
                          />
                          <input
                            type="text"
                            value={slide.caption}
                            onChange={(e) => {
                              const newSlides = [...block.slides];
                              newSlides[slideIdx] = { ...slide, caption: e.target.value };
                              updateCarouselBlock(index, newSlides);
                            }}
                            className="text-xs border border-neutral-100 bg-stone-50/50 px-2 py-1 focus:border-neutral-300 focus:outline-none font-serif italic"
                            placeholder="Caption..."
                          />
                        </div>
                        <div className="md:col-span-1 text-center flex md:flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newSlides = block.slides.filter((_, idx) => idx !== slideIdx);
                              updateCarouselBlock(index, newSlides);
                            }}
                            className="p-1 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer rounded-none"
                            title="Delete slide"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const newSlides = [
                          ...block.slides,
                          { url: '', caption: '' }
                        ];
                        updateCarouselBlock(index, newSlides);
                      }}
                      className="flex items-center space-x-1 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-2 cursor-pointer transition-colors rounded-none mt-2"
                    >
                      <Plus size={10} />
                      <span>Add Slide</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Block Insert Menu (Below) */}
            <div className="absolute top-full left-0 right-0 h-4 opacity-0 hover:opacity-100 transition-opacity z-10">
              <InsertDivider onInsert={(type) => insertBlock(index + 1, type)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Divider component representing floating insert divider
const InsertDivider: React.FC<{
  onInsert: (type: BlockItem['type'] | 'heading-2' | 'heading-3' | 'list-bullet' | 'list-number') => void;
}> = ({ onInsert }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center my-1 select-none" ref={dropdownRef}>
      <div className="absolute left-0 right-0 border-t border-dashed border-neutral-300/60 z-0" />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative z-10 w-6 h-6 flex items-center justify-center border border-neutral-200 bg-white hover:bg-neutral-900 hover:border-neutral-900 hover:text-white transition-all text-neutral-400 cursor-pointer shadow-xs rounded-full transform hover:scale-105"
      >
        <Plus size={12} />
      </button>

      {open && (
        <div className="absolute bottom-7 z-50 bg-white border border-neutral-200/80 shadow-2xl p-2 min-w-[200px] flex flex-col rounded-none text-left anim-fade-in text-xs">
          <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 px-3 py-1.5 border-b border-neutral-50 mb-1">Insert Block</p>
          
          <button
            type="button"
            onClick={() => { onInsert('text'); setOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 text-neutral-700 hover:bg-neutral-50 text-left transition-colors cursor-pointer rounded-none font-sans"
          >
            <Type size={14} className="text-neutral-400" />
            <span>Text Paragraph</span>
          </button>
          
          <button
            type="button"
            onClick={() => { onInsert('heading-2'); setOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 text-neutral-700 hover:bg-neutral-50 text-left transition-colors cursor-pointer rounded-none font-sans"
          >
            <Heading2 size={14} className="text-neutral-400" />
            <span>Heading 2</span>
          </button>

          <button
            type="button"
            onClick={() => { onInsert('heading-3'); setOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 text-neutral-700 hover:bg-neutral-50 text-left transition-colors cursor-pointer rounded-none font-sans"
          >
            <Heading3 size={14} className="text-neutral-400" />
            <span>Heading 3</span>
          </button>

          <button
            type="button"
            onClick={() => { onInsert('list-bullet'); setOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 text-neutral-700 hover:bg-neutral-50 text-left transition-colors cursor-pointer rounded-none font-sans"
          >
            <List size={14} className="text-neutral-400" />
            <span>Bulleted List</span>
          </button>

          <button
            type="button"
            onClick={() => { onInsert('list-number'); setOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 text-neutral-700 hover:bg-neutral-50 text-left transition-colors cursor-pointer rounded-none font-sans"
          >
            <ListOrdered size={14} className="text-neutral-400" />
            <span>Numbered List</span>
          </button>

          <button
            type="button"
            onClick={() => { onInsert('image'); setOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 text-neutral-700 hover:bg-neutral-50 text-left transition-colors cursor-pointer rounded-none font-sans border-t border-neutral-50 mt-1 pt-1.5"
          >
            <ImageIcon size={14} className="text-neutral-400" />
            <span>Single Image</span>
          </button>

          <button
            type="button"
            onClick={() => { onInsert('carousel'); setOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 text-neutral-700 hover:bg-neutral-50 text-left transition-colors cursor-pointer rounded-none font-sans"
          >
            <CarouselIcon size={14} className="text-neutral-400" />
            <span>Image Carousel</span>
          </button>
        </div>
      )}
    </div>
  );
};
