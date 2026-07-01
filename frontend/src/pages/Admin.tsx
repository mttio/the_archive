import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Plus, Edit2, Trash2, RefreshCw, Check } from 'lucide-react';
import { api } from '../services/api';
import type { ContactMessageItem } from '../services/api';
import { useWorks } from '../hooks/useWorks';
import type { WorkItem, TagItem } from '../data/works';

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Custom hook for loading/refreshing works database
  const { works, loading, error, refetch } = useWorks({ includeDrafts: true });

  // Tags list state
  const [tagsList, setTagsList] = useState<TagItem[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Tag creation state
  const [newTagName, setNewTagName] = useState('');
  const [tagFormError, setTagFormError] = useState('');
  const [tagFormSuccess, setTagFormSuccess] = useState('');

  // Contact messages state
  const [messagesList, setMessagesList] = useState<ContactMessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Verify authentication on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('admin_passphrase');
    if (savedToken) {
      setIsAuthenticated(true);
      loadTags();
      loadMessages();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const authorized = await api.verifyPassphrase(passphrase);
      if (authorized) {
        setIsAuthenticated(true);
        loadTags();
        loadMessages();
      } else {
        setLoginError('Invalid secret passphrase.');
      }
    } catch (err) {
      setLoginError('Could not verify passphrase. Make sure your Python backend is running on port 8000.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_passphrase');
    setIsAuthenticated(false);
    setPassphrase('');
  };

  // Load tags list
  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const data = await api.fetchTags();
      setTagsList(data);
    } catch (err: any) {
      console.error('Could not load tags list from server.', err);
    } finally {
      setTagsLoading(false);
    }
  };

  // Load contact inbox messages
  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      const data = await api.fetchContactMessages();
      setMessagesList(data);
    } catch (err: any) {
      console.error('Could not load messages from server.', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this contact message permanently?')) {
      return;
    }
    try {
      await api.deleteContactMessage(id);
      setMessagesList(prev => prev.filter(msg => msg.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete message.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete post "${id}" permanently?`)) {
      return;
    }
    
    try {
      await api.deleteWork(id);
      refetch();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Tag manager operations
  const handleCreateTag = async () => {
    setTagFormError('');
    setTagFormSuccess('');
    if (!newTagName.trim()) {
      setTagFormError('Tag name is required.');
      return;
    }

    try {
      await api.createTag({
        name: newTagName.trim(),
        color: 'stone',
      });
      setTagFormSuccess(`Successfully created tag "${newTagName}".`);
      setNewTagName('');
      loadTags();
    } catch (err: any) {
      setTagFormError(err.message || 'Failed to create tag.');
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    const postCount = works.filter((w) => w.tags && w.tags.some((t) => t.id === id)).length;
    const warningMessage = postCount > 0
      ? `Warning: The tag "${name}" is currently assigned to ${postCount} post(s).\n\nDeleting this tag will remove it from all associated posts. Any published posts left with 0 tags will be automatically moved to drafts.\n\nAre you sure you want to proceed?`
      : `Are you sure you want to delete tag "${name}"?`;

    if (!window.confirm(warningMessage)) {
      return;
    }
    
    try {
      await api.deleteTag(id);
      loadTags();
      refetch(); // Reload works since unlinking changes their tags
    } catch (err: any) {
      alert(`Failed to delete tag: ${err.message}`);
    }
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

  const parseDateString = (dateStr: string): number => {
    if (!dateStr) return 0;
    const months: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    const parts = dateStr.trim().toLowerCase().split(/\s+/);
    if (parts.length === 2) {
      const [monthStr, yearStr] = parts;
      const month = months[monthStr] ?? 0;
      const year = parseInt(yearStr, 10) || 0;
      return new Date(year, month, 1).getTime();
    }
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const publishedWorks = [...works]
    .filter((item) => !item.draft)
    .sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
    
  const draftWorks = [...works]
    .filter((item) => item.draft)
    .sort((a, b) => parseDateString(b.date) - parseDateString(a.date));

  const renderTable = (items: WorkItem[], emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-10 text-neutral-400 italic font-sans text-sm border border-dashed border-neutral-200 bg-stone-50/20">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Mobile View - stacked list of cards */}
        <div className="sm:hidden divide-y divide-neutral-100">
          {items.map((item) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-serif text-base font-normal text-neutral-900 leading-tight">
                    {item.draft ? (
                      item.title
                    ) : (
                      <Link to={`/work/${item.id}`} className="hover:underline hover:text-neutral-700 decoration-none">
                        {item.title}
                      </Link>
                    )}
                  </h4>
                  <span className="block text-[9px] text-neutral-400 font-mono">slug: {item.id}</span>
                </div>
                <div>
                  {item.draft && (
                    <span className="inline-block text-[8px] font-semibold uppercase tracking-wider text-neutral-500 bg-stone-100 border border-neutral-200/60 px-1.5 py-0.5 rounded-full font-sans">
                      Draft
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {item.tags && item.tags.length > 0 ? (
                  item.tags.map(t => (
                    <span key={t.id} className="text-[8px] font-semibold uppercase tracking-wider rounded-full px-1.5 py-0.2 border border-neutral-200 bg-neutral-50 text-neutral-500">
                      {t.name}
                    </span>
                  ))
                ) : (
                  <span className="text-[8px] text-neutral-400 font-sans italic">no tags</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 pt-1 text-xs">
                <span className="text-neutral-400 font-sans text-[11px]">{formatDateForDisplay(item.date) || '—'}</span>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/admin/edit/${item.id}`}
                    className="flex items-center space-x-1.5 border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer rounded-none decoration-none"
                    title="Edit item"
                  >
                    <Edit2 size={10} />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center space-x-1.5 border border-rose-200 bg-rose-50/50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100/50 transition-colors cursor-pointer rounded-none"
                    title="Delete item"
                  >
                    <Trash2 size={10} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - structured table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4 font-sans">Title</th>
                <th className="py-3 px-4 font-sans">Timeline</th>
                <th className="py-3 px-4 font-sans">Tags</th>
                <th className="py-3 px-4 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    <div className="flex items-center space-x-2">
                      {item.draft ? (
                        <span>{item.title}</span>
                      ) : (
                        <Link to={`/work/${item.id}`} className="hover:underline hover:text-neutral-700 decoration-none">
                          {item.title}
                        </Link>
                      )}
                      {item.draft && (
                        <span className="inline-block text-[8px] font-semibold uppercase tracking-wider text-neutral-500 bg-stone-100 border border-neutral-200 px-1.5 py-0.2 rounded-full font-sans">
                          Draft
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-neutral-400 font-mono mt-0.5">slug: {item.id}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-neutral-500">{formatDateForDisplay(item.date) || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.tags && item.tags.length > 0 ? (
                        item.tags.map(t => (
                          <span key={t.id} className="text-[9px] font-semibold uppercase tracking-wider rounded-full px-1.5 py-0.2 border border-neutral-200 bg-neutral-50 text-neutral-500">
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-neutral-400 font-sans italic">no tags</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/edit/${item.id}`}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-transparent hover:border-neutral-200 hover:bg-white transition-colors cursor-pointer rounded-none"
                        title="Edit item"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 border border-transparent hover:border-rose-100 hover:bg-rose-50/50 transition-colors cursor-pointer rounded-none"
                        title="Delete item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Login view if unauthorized
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-12 px-6">
        <div className="w-full max-w-md border border-neutral-200 bg-white p-8 rounded-none shadow-sm space-y-6 text-left">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-neutral-900 tracking-tight">Admin Portal</h1>
            <p className="text-sm text-neutral-500 font-sans">
              Enter secret passphrase to access portfolio console database.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-none">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="passphrase" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Passphrase
              </label>
              <input
                type="password"
                id="passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                required
                className="w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center space-x-2 rounded-none bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Unlock Console</span>
              <LogIn size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 md:py-20 space-y-10 text-left max-w-5xl mx-auto">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Control Console
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Database Status: <span className={error ? 'text-rose-500 font-semibold' : 'text-emerald-600 font-semibold'}>
              {error ? 'API Offline (Mock Mode)' : 'Connected'}
            </span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { refetch(); loadTags(); }}
            className="flex items-center space-x-1.5 border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:border-neutral-400 transition-colors cursor-pointer rounded-none"
            title="Refresh database"
          >
            <RefreshCw size={14} className={loading || tagsLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/admin/new"
            className="flex items-center space-x-1.5 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer rounded-none decoration-none"
          >
            <Plus size={14} />
            <span>New Post</span>
          </Link>
          <button
            onClick={handleLogout}
            className="border border-rose-200 bg-rose-50/50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100/50 transition-colors cursor-pointer rounded-none"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Works Database */}
      <div className="space-y-8">
        {/* Published Posts */}
        <div className="border border-neutral-200 bg-white rounded-none p-6 sm:p-8">
          <h3 className="font-serif text-xl font-normal text-neutral-900 border-b border-neutral-200/60 pb-3 mb-6 flex items-center justify-between">
            <span>Published Posts</span>
            <span className="text-xs font-sans font-normal text-neutral-400">({publishedWorks.length})</span>
          </h3>
          {loading ? (
            <div className="text-center py-10 text-neutral-500 font-sans">Loading database elements...</div>
          ) : (
            renderTable(publishedWorks, "No published posts yet. Draft items can be published using the edit console.")
          )}
        </div>

        {/* Drafts */}
        <div className="border border-neutral-200 bg-white rounded-none p-6 sm:p-8">
          <h3 className="font-serif text-xl font-normal text-neutral-900 border-b border-neutral-200/60 pb-3 mb-6 flex items-center justify-between">
            <span>Drafts</span>
            <span className="text-xs font-sans font-normal text-neutral-400">({draftWorks.length})</span>
          </h3>
          {loading ? (
            <div className="text-center py-10 text-neutral-500 font-sans">Loading database elements...</div>
          ) : (
            renderTable(draftWorks, "No drafts found. Click 'New Post' to create a work in progress.")
          )}
        </div>
      </div>

      {/* Tag Manager Section */}
      <div className="border border-neutral-200 bg-white rounded-none p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl font-normal text-neutral-900 border-b border-neutral-200/60 pb-3 mb-6">
          Tag Manager
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Create Tag Form */}
          <div className="md:col-span-1 border border-neutral-200 p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 pb-2 border-b border-neutral-100">Create New Tag</h4>
            {tagFormError && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3.5 rounded-none">
                {tagFormError}
              </div>
            )}
            {tagFormSuccess && (
              <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 p-3.5 rounded-none flex items-center space-x-2">
                <Check size={14} />
                <span>{tagFormSuccess}</span>
              </div>
            )}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tag Name</label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full rounded-none border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
                placeholder="e.g. Next.js, Sketching"
              />
            </div>
            
            <button
              type="button"
              onClick={handleCreateTag}
              className="w-full flex items-center justify-center space-x-1.5 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer rounded-none"
            >
              <Plus size={12} />
              <span>Add Tag</span>
            </button>
          </div>
          
          {/* List of existing tags */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 pb-2 border-b border-neutral-100">Existing Tags ({tagsList.length})</h4>
            {tagsLoading ? (
              <div className="text-center py-6 text-neutral-500 font-sans text-sm">Loading tags...</div>
            ) : tagsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tagsList.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-3.5 border border-neutral-200 bg-stone-50/50">
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 border border-neutral-200 bg-neutral-50 text-neutral-500">
                      {tag.name}
                    </span>
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="text-neutral-400 hover:text-rose-600 p-1.5 border border-transparent hover:border-rose-100 hover:bg-rose-50/50 transition-colors cursor-pointer"
                      title="Delete tag"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-400 text-sm italic font-sans">No tags defined yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Inbox Section */}
      <div className="border border-neutral-200 bg-white rounded-none p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl font-normal text-neutral-900 border-b border-neutral-200/60 pb-3 mb-6">
          Contact Inbox
        </h3>
        
        {messagesLoading ? (
          <div className="text-center py-8 text-neutral-500 font-sans text-sm">Loading messages...</div>
        ) : messagesList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="pb-3 pr-4 font-bold">Date</th>
                  <th className="pb-3 px-4 font-bold">Sender</th>
                  <th className="pb-3 px-4 font-bold">Topic</th>
                  <th className="pb-3 px-4 font-bold w-1/2">Message</th>
                  <th className="pb-3 pl-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {messagesList.map((msg) => (
                  <tr key={msg.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 pr-4 text-xs text-neutral-500 whitespace-nowrap align-top">
                      {new Date(msg.created_at + 'Z').toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="font-semibold text-neutral-800">{msg.name}</div>
                      <a href={`mailto:${msg.email}`} className="text-xs text-neutral-400 hover:underline">{msg.email}</a>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border border-neutral-200 bg-neutral-50 text-neutral-500">
                        {msg.subject}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-neutral-600 leading-relaxed break-words align-top text-xs whitespace-pre-wrap">
                      {msg.message}
                    </td>
                    <td className="py-4 pl-4 text-right align-top">
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1.5 border border-transparent hover:border-rose-100 hover:bg-rose-50/50 transition-colors cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-400 text-sm italic font-sans">No messages received yet.</div>
        )}
      </div>
    </div>
  );
};
