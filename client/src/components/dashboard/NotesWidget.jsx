import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PencilLine, Plus, Check } from 'lucide-react';

const NotesWidget = () => {
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  // Fetch the latest dashboard entry to resume tracking seamlessly
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.length > 0) {
          const latest = res.data[0];
          if (latest.title === 'Dashboard Entry') {
            setContent(latest.content || '');
            setNoteId(latest._id);
          }
        }
      } catch (e) { console.error(e); }
      finally { setIsInitialLoad(false); }
    };
    if (token) fetchLatest();
  }, [token]);

  // Real-time automatic debounce mirroring perfectly mapped to backend Note databases
  useEffect(() => {
    if (isInitialLoad || (!content.trim() && !noteId)) return;

    const saveNote = setTimeout(async () => {
      setSaving(true);
      try {
        if (!noteId) {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/notes`,
            { title: 'Dashboard Entry', content },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setNoteId(res.data._id);
        } else {
          await axios.put(`${import.meta.env.VITE_API_URL}/notes/${noteId}`,
            { title: 'Dashboard Entry', content },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (e) { console.error("Widget Auto-save failed", e); }
      finally { setSaving(false); }
    }, 400); // 400ms ultra-low latency push

    return () => clearTimeout(saveNote);
  }, [content, noteId, token, isInitialLoad]);

  const handleNewNote = () => {
    setContent('');
    setNoteId(null);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col h-[500px] hover:shadow-md transition-all duration-300 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg">
            <PencilLine className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-main">Quick Note</h2>
        </div>

        <button
          onClick={handleNewNote}
          className="px-4 py-2 text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      <div className="flex-1 flex flex-col relative group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your quick note... It auto-saves instantly to your Journal module! Click 'New Note' above to generate another fresh one seamlessly."
          className="flex-1 w-full bg-bg-input border border-border rounded-xl p-5 text-main resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-[1rem] leading-relaxed custom-scrollbar placeholder:text-muted/50"
        />
        <div className={`absolute bottom-4 right-4 text-xs font-bold px-3 py-1.5 rounded transition-all bg-card shadow-sm border border-border ${saving ? 'text-primary opacity-100' : (noteId ? 'text-emerald-500 opacity-100' : 'opacity-0')}`}>
          {saving ? 'Saving...' : 'Auto-saved'}
        </div>
      </div>
    </div>
  );
};

export default NotesWidget;
