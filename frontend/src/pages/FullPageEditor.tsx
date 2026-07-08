import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Check,
  X,
  AlertCircle,
  Eye,
  FileText,
  Upload,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  Sliders as CarouselIcon,
  LayoutGrid
} from 'lucide-react';
import { api } from '../services/api';
import type { ApiWorkInput } from '../services/api';
import type { TagItem } from '../data/works';
import { parseMarkdownToReact } from '../utils/markdown';

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

const getDatePickerValue = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parsed = parseDateString(dateStr);
  if (parsed === 0) return new Date().toISOString().split('T')[0];
  return new Date(parsed).toISOString().split('T')[0];
};

export const FullPageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // undefined or "new" or existing id
  const navigate = useNavigate();
  const isCreateMode = !id || id === 'new';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Available tags list
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  // Form state
  const [formData, setFormData] = useState<ApiWorkInput>({
    id: '',
    title: '',
    subtitle: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200',
    draft: true,
    tag_ids: [],
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const toolbarMediaInputRef = useRef<HTMLInputElement>(null);
  const toolbarUploadModeRef = useRef<'image' | 'carousel' | 'collage'>('image');

  // Verify auth on mount and load data
  useEffect(() => {
    const token = sessionStorage.getItem('admin_passphrase');
    if (!token) {
      navigate('/admin');
      return;
    }

    async function loadEditorData() {
      setLoading(true);
      try {
        // Load tags
        const tags = await api.fetchTags();
        setAvailableTags(tags);

        if (!isCreateMode && id) {
          // Edit mode: fetch existing post
          const post = await api.fetchWorkById(id);
          setFormData({
            id: post.id,
            title: post.title,
            subtitle: post.subtitle || '',
            content: post.content || '',
            date: post.date || '',
            imageUrl: post.imageUrl || '',
            draft: !!post.draft,
            tag_ids: post.tags ? post.tags.map(t => t.id) : [],
          });
        } else {
          // Create mode
          setFormData({
            id: '',
            title: 'Untitled Post',
            subtitle: 'Write an elegant subtitle or summary hook here...',
            content: '',
            date: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200',
            draft: true,
            tag_ids: [],
          });
        }
      } catch (err: any) {
        setFormError('Failed to load post data from API database.');
      } finally {
        setLoading(false);
      }
    }

    loadEditorData();
  }, [id, isCreateMode, navigate]);

  // Helper to slugify titles to IDs
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updatedId = isCreateMode ? slugify(val) : prev.id;
      return {
        ...prev,
        title: val,
        id: updatedId,
      };
    });
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const selected = text.substring(start, end);

    let replacement = '';
    if (syntax === 'bold') {
      replacement = `**${selected || 'bold text'}**`;
    } else if (syntax === 'italic') {
      replacement = `*${selected || 'italic text'}*`;
    } else if (syntax === 'h2') {
      replacement = `\n## ${selected || 'Heading 2'}\n`;
    } else if (syntax === 'h3') {
      replacement = `\n### ${selected || 'Heading 3'}\n`;
    } else if (syntax === 'bullet') {
      replacement = `\n- ${selected || 'List item'}`;
    } else if (syntax === 'number') {
      replacement = `\n1. ${selected || 'List item'}`;
    } else if (syntax === 'image') {
      replacement = `\n![[image: https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200 | layout: center | caption: Caption]]\n`;
    } else if (syntax === 'carousel') {
      replacement = `\n![[carousel: url1, url2 | captions: Slide 1, Slide 2]]\n`;
    } else if (syntax === 'collage') {
      replacement = `\n![[collage: url1, url2 | caption: Caption]]\n`;
    }

    const newContent = before + replacement + after;
    setFormData(prev => ({ ...prev, content: newContent }));

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      const newPos = start + replacement.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setFormData(prev => ({
          ...prev,
          content: text
        }));
        setFormSuccess('Markdown file imported successfully!');
        setTimeout(() => setFormSuccess(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleCoverImageUploadClick = () => {
    coverImageInputRef.current?.click();
  };

  const handleCoverImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setFormError('');
    try {
      const res = await api.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: res.url
      }));
      setFormSuccess('Cover image uploaded successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Cover image upload failed.');
    } finally {
      setSaving(false);
      if (coverImageInputRef.current) coverImageInputRef.current.value = '';
    }
  };

  const triggerToolbarMediaUpload = (mode: 'image' | 'carousel' | 'collage') => {
    toolbarUploadModeRef.current = mode;
    toolbarMediaInputRef.current?.click();
  };

  const handleToolbarMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSaving(true);
    setFormError('');
    try {
      const uploadPromises = Array.from(files).map(file => api.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);
      
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      let replacement = '';
      const mode = toolbarUploadModeRef.current;
      
      if (mode === 'image') {
        const url = urls[0];
        replacement = `\n![[image: ${url} | layout: center | caption: Caption]]\n`;
      } else if (mode === 'carousel') {
        const urlStr = urls.join(', ');
        const captionStr = urls.map((_, idx) => `Slide ${idx + 1}`).join(', ');
        replacement = `\n![[carousel: ${urlStr} | captions: ${captionStr}]]\n`;
      } else if (mode === 'collage') {
        const urlStr = urls.join(', ');
        replacement = `\n![[collage: ${urlStr} | caption: Caption]]\n`;
      }

      const newContent = before + replacement + after;
      setFormData(prev => ({ ...prev, content: newContent }));
      
      setFormSuccess('Media uploaded and embedded successfully!');
      setTimeout(() => setFormSuccess(''), 3000);

      // Re-focus and set selection
      setTimeout(() => {
        textarea.focus();
        const newPos = start + replacement.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 50);

    } catch (err: any) {
      setFormError(err.message || 'Media upload failed.');
    } finally {
      setSaving(false);
      if (toolbarMediaInputRef.current) toolbarMediaInputRef.current.value = '';
    }
  };

  const savePost = async (isDraft: boolean) => {
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    if (isCreateMode && (!formData.id || !formData.id.trim())) {
      setFormError('Slug ID is required.');
      return;
    }

    // Publish validations
    if (!isDraft) {
      if (!formData.subtitle.trim()) {
        setFormError('Subtitle is required to publish.');
        return;
      }
      if (formData.tag_ids.length === 0) {
        setFormError('Select at least one tag to publish.');
        return;
      }
    }

    const payload = {
      ...formData,
      draft: isDraft,
    };

    setSaving(true);
    try {
      if (isCreateMode) {
        await api.createWork(payload);
        setFormSuccess('Article created successfully!');
      } else {
        await api.updateWork(id!, payload);
        setFormSuccess('Article updated successfully!');
      }

      // Redirect back to console dashboard after short delay
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Check database unique slug constraints.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-neutral-500 animate-pulse font-sans">Loading visual workspace editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 text-left">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,.txt,.markdown"
        className="hidden"
      />
      <input
        type="file"
        ref={coverImageInputRef}
        onChange={handleCoverImageFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={toolbarMediaInputRef}
        onChange={handleToolbarMediaFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Sticky Edit Control Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-900 mb-8">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="p-2 border border-neutral-200 dark:border-stone-800 hover:border-neutral-400 dark:hover:border-stone-600 text-neutral-500 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 transition-colors flex items-center justify-center rounded-none"
              title="Return to Dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h1 className="font-sans font-light uppercase text-xs sm:text-sm text-neutral-900 dark:text-stone-100 leading-none">
                  {isCreateMode ? 'Drafting New Post' : 'Editing Post'}
                </h1>
                <span className="text-[9px] text-neutral-400 font-mono mt-0.5 block">
                  Status: {formData.draft ? 'DRAFT' : 'PUBLISHED'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 border border-neutral-200 dark:border-stone-800 bg-neutral-50 dark:bg-stone-900/50 px-2.5 py-1 font-mono text-[11px] text-neutral-600 dark:text-stone-300">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Slug:</span>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: slugify(e.target.value) }))}
                  placeholder="slug-url-identifier"
                  className="bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-stone-700 focus:border-neutral-400 dark:focus:border-stone-600 focus:outline-none w-40 sm:w-56 text-[11px] font-mono text-neutral-800 dark:text-stone-200"
                />
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-3">
            {formError && (
              <div className="flex items-center space-x-1 text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2">
                <AlertCircle size={14} />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2">
                <Check size={14} />
                <span>{formSuccess}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => savePost(true)}
              disabled={saving}
              className="border border-neutral-300 dark:border-stone-800 bg-neutral-100 dark:bg-stone-900 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-stone-300 hover:bg-neutral-200 dark:hover:bg-stone-800 transition-colors cursor-pointer rounded-none disabled:bg-neutral-50 disabled:text-neutral-400"
            >
              Save as Draft
            </button>
            
            <button
              type="button"
              onClick={() => savePost(false)}
              disabled={saving}
              className="flex items-center justify-center space-x-1.5 bg-neutral-900 dark:bg-white px-5 py-2 text-xs font-semibold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-none disabled:bg-neutral-400"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editor Content Canvas Container */}
      <article className="max-w-4xl mx-auto space-y-8">

        {/* Metadata section (Title, Subtitle, Date) */}
        <div className="space-y-4">
          {/* Title Editor */}
          <div className="relative group/title">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-sans font-light uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight text-neutral-900 dark:text-stone-100 leading-tight w-full bg-transparent border-0 border-b border-transparent focus:border-neutral-200 dark:focus:border-stone-800 focus:outline-none py-1"
              placeholder="Enter Title..."
            />
          </div>

          {/* Subtitle Editor */}
          <div className="relative group/subtitle">
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="text-lg sm:text-xl text-neutral-600 dark:text-stone-400 font-sans font-light max-w-3xl w-full bg-transparent border-0 border-b border-transparent focus:border-neutral-200 dark:focus:border-stone-800 focus:outline-none py-1 resize-none h-auto overflow-hidden"
              rows={2}
              placeholder="Enter subtitle and short description hook..."
            />
          </div>

          {/* Timeline & Tags Editor (Unified top metadata bar) */}
          <div className="flex flex-wrap items-center gap-6 border-b border-neutral-100 pb-4 pt-2 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Timeline:</span>
              <input
                type="date"
                value={getDatePickerValue(formData.date)}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="text-sm text-neutral-700 dark:text-stone-300 bg-transparent border-0 border-b border-transparent focus:border-neutral-200 dark:focus:border-stone-800 focus:outline-none py-0.5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                  const isSelected = formData.tag_ids.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => {
                        setFormData(prev => {
                          const ids = prev.tag_ids.includes(tag.id)
                            ? prev.tag_ids.filter(id => id !== tag.id)
                            : [...prev.tag_ids, tag.id];
                          return { ...prev, tag_ids: ids };
                        });
                      }}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 border-neutral-900 text-white font-bold dark:bg-white dark:border-stone-200 dark:text-black'
                          : 'text-neutral-400 border-neutral-200/80 dark:border-stone-850 bg-neutral-50 dark:bg-stone-900 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 font-semibold'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {availableTags.length === 0 && (
                  <span className="text-xs text-neutral-400 italic">No tags found. Create tags in Admin console.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Showcase Hero Image Editor */}
        {formData.imageUrl && formData.imageUrl.trim() !== '' ? (
          <div className="relative aspect-video w-full overflow-hidden bg-neutral-50 group/image">
            <img
              src={formData.imageUrl}
              alt="Hero Header"
              className="h-full w-full object-cover"
            />
            
            {/* Overlay mask */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCoverImageUploadClick}
                className="bg-white dark:bg-stone-900 text-neutral-900 dark:text-stone-100 hover:bg-neutral-900 dark:hover:bg-stone-250 hover:text-white dark:hover:text-stone-950 px-4 py-2 text-xs font-semibold transition-all cursor-pointer rounded-none border border-neutral-200 dark:border-stone-800"
              >
                Upload Cover Image
              </button>
              <button
                type="button"
                onClick={() => setShowImagePopover(!showImagePopover)}
                className="bg-white/80 dark:bg-stone-900/80 text-neutral-900 dark:text-stone-100 hover:bg-white dark:hover:bg-stone-800 px-4 py-2 text-xs font-semibold transition-all cursor-pointer rounded-none border border-neutral-200 dark:border-stone-800"
              >
                Change Cover Image URL
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer rounded-none border border-rose-600"
              >
                Remove Cover Image
              </button>
            </div>

            {/* Image Url Popover Card */}
            {showImagePopover && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-stone-900 border border-neutral-200 dark:border-stone-800 shadow-2xl p-4 w-full max-w-md rounded-none text-left">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-stone-800 pb-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Hero Image Settings</span>
                  <button
                    type="button"
                    onClick={() => setShowImagePopover(false)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Hero Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full text-xs border border-neutral-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-neutral-800 dark:text-stone-100 focus:border-neutral-400 dark:focus:border-stone-600 focus:outline-none"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImagePopover(false)}
                    className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold py-2 transition-colors cursor-pointer rounded-none"
                  >
                    Apply Image
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-300 dark:border-stone-800 bg-neutral-50/50 dark:bg-stone-900/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-sm font-semibold text-neutral-700 dark:text-stone-300 block">No cover image set</span>
              <span className="text-xs text-neutral-400 block font-light">This article will use the text-only layout variation.</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCoverImageUploadClick}
                className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
              >
                Upload Cover Image
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200' }));
                  setShowImagePopover(true);
                }}
                className="bg-white dark:bg-stone-900 hover:bg-neutral-50 dark:hover:bg-stone-800 border border-neutral-200 dark:border-stone-800 text-neutral-800 dark:text-stone-100 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
              >
                Add Cover Image URL
              </button>
            </div>
          </div>
        )}

        {/* Tab Selection (Write vs Preview) */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2 pt-4">
          <div className="flex space-x-1 bg-stone-100 dark:bg-stone-900 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                activeTab === 'write'
                  ? 'bg-white dark:bg-black text-neutral-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-neutral-500 dark:text-stone-400 hover:text-neutral-800 dark:hover:text-stone-200'
              }`}
            >
              <FileText size={14} />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-black text-neutral-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-neutral-500 dark:text-stone-400 hover:text-neutral-800 dark:hover:text-stone-200'
              }`}
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          </div>

          {activeTab === 'write' && (
            <button
              type="button"
              onClick={handleImportClick}
              className="flex items-center space-x-1.5 border border-neutral-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-neutral-50 dark:hover:bg-stone-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-stone-300 transition-colors cursor-pointer rounded-none"
            >
              <Upload size={12} />
              <span>Import Markdown</span>
            </button>
          )}
        </div>

        {/* Main Work Content Area */}
        <div className="pt-2">
          {activeTab === 'write' ? (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 border border-neutral-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 p-1.5 select-none">
                <button
                  type="button"
                  onClick={() => insertMarkdown('bold')}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Bold (**text**)"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('italic')}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Italic (*text*)"
                >
                  <Italic size={14} />
                </button>
                <div className="h-4 w-px bg-neutral-300 dark:bg-stone-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('h2')}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Heading 2 (##)"
                >
                  <Heading2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('h3')}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Heading 3 (###)"
                >
                  <Heading3 size={14} />
                </button>
                <div className="h-4 w-px bg-neutral-300 dark:bg-stone-800 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('bullet')}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Bulleted List (-)"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('number')}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Numbered List (1.)"
                >
                  <ListOrdered size={14} />
                </button>
                <div className="h-4 w-px bg-neutral-300 dark:bg-stone-800 mx-1" />
                <button
                  type="button"
                  onClick={() => triggerToolbarMediaUpload('image')}
                  className="flex items-center space-x-1 px-2 py-1 text-[10px] uppercase font-bold tracking-wider hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Embed Single Image"
                >
                  <ImageIcon size={12} />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToolbarMediaUpload('carousel')}
                  className="flex items-center space-x-1 px-2 py-1 text-[10px] uppercase font-bold tracking-wider hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Embed Carousel"
                >
                  <CarouselIcon size={12} />
                  <span>Carousel</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToolbarMediaUpload('collage')}
                  className="flex items-center space-x-1 px-2 py-1 text-[10px] uppercase font-bold tracking-wider hover:bg-neutral-200 dark:hover:bg-stone-800 text-neutral-600 dark:text-stone-400 hover:text-neutral-900 dark:hover:text-stone-100 cursor-pointer"
                  title="Embed Collage Grid"
                >
                  <LayoutGrid size={12} />
                  <span>Collage</span>
                </button>
              </div>

              {/* Textarea Editor Box */}
              <textarea
                ref={textareaRef}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full min-h-[450px] border border-neutral-200 dark:border-stone-800 p-4 font-sans font-light text-sm leading-relaxed focus:border-neutral-400 dark:focus:border-stone-600 focus:outline-none bg-white dark:bg-stone-900 text-neutral-800 dark:text-stone-100 resize-y"
                placeholder="Write article content in standard Markdown style... Use the toolbar shortcuts to embed custom Obsidian-style media links such as ![[image: url | layout: center]]"
              />
            </div>
          ) : (
             <div className="border border-neutral-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 md:p-8 min-h-[500px]">
               <div className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto text-left font-sans font-light text-neutral-800 dark:text-stone-300">
                {parseMarkdownToReact(formData.content)}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};
