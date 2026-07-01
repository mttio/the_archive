import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { ApiWorkInput } from '../services/api';
import type { TagItem } from '../data/works';
import { BlockEditor } from '../components/BlockEditor';

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
  const [showTagsPopover, setShowTagsPopover] = useState(false);
  const [showImagePopover, setShowImagePopover] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ApiWorkInput>({
    id: '',
    title: '',
    subtitle: '',
    content: JSON.stringify([{ type: 'text', id: 'init-text', value: '' }]),
    date: new Date().toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200',
    draft: true,
    tag_ids: [],
  });

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
            content: JSON.stringify([{ type: 'text', id: 'init-text', value: '' }]),
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

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTagsPopover(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
        await api.updateWork(formData.id!, payload);
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

  // Active tags mapping
  const activeTagsList = availableTags.filter(tag => formData.tag_ids.includes(tag.id));

  return (
    <div className="min-h-screen pb-24 text-left">
      {/* Sticky Edit Control Header Bar */}
      <header className="sticky top-0 z-40 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white/90 backdrop-blur-md border-b border-neutral-200 mb-8">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="p-2 border border-neutral-200 hover:border-neutral-400 text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center rounded-none"
              title="Return to Dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h1 className="font-serif text-sm font-bold text-neutral-900 leading-none">
                  {isCreateMode ? 'Drafting New Post' : 'Editing Post'}
                </h1>
                <span className="text-[9px] text-neutral-400 font-mono mt-0.5 block">
                  Status: {formData.draft ? 'DRAFT' : 'PUBLISHED'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-[11px] text-neutral-600">
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Slug:</span>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: slugify(e.target.value) }))}
                  placeholder="slug-url-identifier"
                  className="bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-400 focus:outline-none w-40 sm:w-56 text-[11px] font-mono text-neutral-800"
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
              className="border border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer rounded-none disabled:bg-neutral-50 disabled:text-neutral-400"
            >
              Save as Draft
            </button>
            
            <button
              type="button"
              onClick={() => savePost(false)}
              disabled={saving}
              className="flex items-center justify-center space-x-1.5 bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer rounded-none disabled:bg-neutral-400"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editor Content Canvas Container */}
      <article className="max-w-4xl mx-auto space-y-12">

        {/* Metadata section (Title, Subtitle, Date) */}
        <div className="space-y-4">
          {/* Title Editor */}
          <div className="relative group/title">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight w-full bg-transparent border-0 border-b border-transparent focus:border-neutral-200 focus:outline-none py-1"
              placeholder="Enter Title..."
            />
          </div>

          {/* Subtitle Editor */}
          <div className="relative group/subtitle">
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="text-lg sm:text-xl text-neutral-600 font-serif italic font-light max-w-3xl w-full bg-transparent border-0 border-b border-transparent focus:border-neutral-200 focus:outline-none py-1 resize-none h-auto overflow-hidden"
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
                className="text-sm text-neutral-700 bg-transparent border-0 border-b border-transparent focus:border-neutral-200 focus:outline-none py-0.5"
              />
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeTagsList.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-500"
                  >
                    {tag.name}
                  </span>
                ))}
                {activeTagsList.length === 0 && (
                  <span className="text-xs text-neutral-400 italic">No tags selected.</span>
                )}
              </div>

              {/* Spacious Checkbox Dropdown */}
              <div className="relative inline-block text-left" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTagsPopover(!showTagsPopover)}
                  className="inline-flex items-center gap-x-1 border border-neutral-200 bg-white px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors cursor-pointer rounded-none"
                >
                  <span>Edit Tags</span>
                  <svg className="h-3 w-3 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {showTagsPopover && (
                  <div className="absolute left-0 mt-2 z-50 w-52 border border-neutral-200 bg-white shadow-xl rounded-none text-left">
                    <div className="py-1 divide-y divide-neutral-100">
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
                            className="flex items-center justify-between w-full px-3 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <span className="uppercase tracking-wider text-[10px]">{tag.name}</span>
                            <div className={`h-3.5 w-3.5 border flex items-center justify-center rounded-none transition-all ${
                              isSelected ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-neutral-300'
                            }`}>
                              {isSelected && (
                                <svg className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {availableTags.length === 0 && (
                        <div className="px-3 py-2.5 text-xs text-neutral-400 italic">No tags found.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Showcase Hero Image Editor */}
        {formData.imageUrl && formData.imageUrl.trim() !== '' ? (
          <div className="relative aspect-video w-full overflow-hidden border border-neutral-200 bg-neutral-100 group/image">
            <img
              src={formData.imageUrl}
              alt="Hero Header"
              className="h-full w-full object-cover"
            />
            
            {/* Overlay mask */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowImagePopover(!showImagePopover)}
                className="bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer rounded-none border border-neutral-200"
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-neutral-200 shadow-2xl p-4 w-full max-w-md rounded-none text-left">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-3">
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
                      className="w-full text-xs border border-neutral-200 px-3 py-2 focus:border-neutral-400 focus:outline-none"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImagePopover(false)}
                    className="w-full bg-neutral-900 text-white text-xs font-semibold py-2 transition-colors cursor-pointer rounded-none"
                  >
                    Apply Image
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-300 bg-neutral-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-sm font-semibold text-neutral-700 block">No cover image set</span>
              <span className="text-xs text-neutral-400 block font-light">This article will use the text-only layout variation.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200' }));
                setShowImagePopover(true);
              }}
              className="bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
            >
              Add Cover Image
            </button>
          </div>
        )}

        {/* Main content blocks visual canvas */}
        <div className="max-w-3xl mx-auto pt-6">
          <BlockEditor
            value={formData.content}
            onChange={(newValue) => setFormData(prev => ({ ...prev, content: newValue }))}
          />
        </div>
      </article>
    </div>
  );
};
