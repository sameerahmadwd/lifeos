import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';
import { Plus, Trash2, Loader2, Search, BookOpen, ChevronDown, ChevronRight, ChevronLeft, Calendar as CalendarIcon, X } from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedDates, setCollapsedDates] = useState({});

  // Date Range Filter
  const [dateFilter, setDateFilter] = useState({ start: null, end: null });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-save debounce
  useEffect(() => {
    if (!activeNote || !token) return;
    const saveNote = setTimeout(async () => {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/notes/${activeNote._id}`,
          { title: activeNote.title, content: activeNote.content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotes(prev => prev.map(n => n._id === activeNote._id ? activeNote : n));
      } catch (e) { console.error("Note autosave failed.", e); }
    }, 400);
    return () => clearTimeout(saveNote);
  }, [activeNote, token]);

  useEffect(() => {
    if (!token) return navigate('/login');
    const fetchInitial = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(res.data || []);
        if (res.data && res.data.length > 0) setActiveNote(res.data[0]);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchInitial();
  }, [token, navigate]);

  const handleAdd = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/notes`,
        { title: 'New Entry', content: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([res.data, ...notes]);
      setActiveNote(res.data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const remaining = notes.filter(n => n._id !== id);
      setNotes(remaining);
      if (activeNote?._id === id) setActiveNote(remaining.length > 0 ? remaining[0] : null);
    } catch (e) { console.error(e); }
  };

  const toggleDateCollapse = (dateKey) => {
    setCollapsedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  // Calendar helpers
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();

  const toYMD = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatRangeLabel = () => {
    if (!dateFilter.start && !dateFilter.end) return 'All Time';
    const fmt = (str) => {
      const [y, m, d] = str.split('-');
      return new Date(y, m - 1, d).toLocaleString('default', { month: 'short', day: 'numeric' });
    };
    if (dateFilter.start && !dateFilter.end) return `${fmt(dateFilter.start)}...`;
    return `${fmt(dateFilter.start)} – ${fmt(dateFilter.end)}`;
  };

  const selectDay = (day) => {
    const dStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDateFilter(prev => {
      if (!prev.start || (prev.start && prev.end)) return { start: dStr, end: null };
      if (dStr < prev.start) return { start: dStr, end: prev.start };
      setIsCalendarOpen(false);
      return { start: prev.start, end: dStr };
    });
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q);

      let matchesDate = true;
      if (dateFilter.start || dateFilter.end) {
        const noteDate = n.updatedAt ? toYMD(n.updatedAt) : null;
        if (!noteDate) return false;
        if (dateFilter.start && dateFilter.end) {
          matchesDate = noteDate >= dateFilter.start && noteDate <= dateFilter.end;
        } else if (dateFilter.start) {
          matchesDate = noteDate === dateFilter.start;
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [notes, searchQuery, dateFilter]);

  // Group by date
  const groupedNotes = useMemo(() => {
    const groups = {};
    filteredNotes.forEach(note => {
      const dateStr = note.updatedAt
        ? new Date(note.updatedAt).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Undated';
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(note);
    });
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (a === 'Undated') return 1;
      if (b === 'Undated') return -1;
      return new Date(b) - new Date(a);
    });
    return { groups, sortedDates };
  }, [filteredNotes]);

  // Compute which YYYY-MM-DD dates have notes
  const noteDates = useMemo(() => {
    const set = new Set();
    notes.forEach(n => {
      if (n.updatedAt) set.add(toYMD(n.updatedAt));
    });
    return set;
  }, [notes]);

  const hasActiveFilter = dateFilter.start || dateFilter.end;

  if (isLoading) return <div className="min-h-screen bg-site flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-site font-sans flex overflow-hidden">
      <TopNav />
      <Sidebar />
      <BottomNav />
      <main className="flex-1 ml-0 md:ml-[260px] pt-[72px] pb-[72px] md:pb-0 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-card shadow-sm md:border-t md:border-l border-border mt-0 md:mt-2 ml-0 md:ml-2 md:rounded-tl-3xl relative">

          {/* Left Sidebar Pane */}
          <div className={`${activeNote ? 'hidden md:flex' : 'flex'} w-full md:w-[300px] bg-card md:border-r border-border flex-col h-full flex-shrink-0`}>
            
            {/* Header & Controls */}
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-main tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Journals
                  <span className="ml-1 px-2 py-0.5 bg-bg-input text-muted text-[0.65rem] font-black rounded-full border border-border uppercase tracking-tighter">
                    {notes.length} Total
                  </span>
                </h2>
                <button
                  onClick={handleAdd}
                  className="p-2 bg-primary text-white hover:bg-primary-hover rounded-xl transition-all shadow-sm font-bold active:scale-95"
                  title="New Entry"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search journals..."
                  className="w-full bg-bg-input border border-border rounded-xl py-2 pl-9 pr-4 text-sm font-semibold text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted/30"
                />
              </div>

              {/* Date Range Filter */}
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className={`w-full flex items-center gap-2 justify-between px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
                    hasActiveFilter
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-bg-input border-border text-muted hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs">{formatRangeLabel()}</span>
                  </div>
                  {hasActiveFilter && (
                    <X
                      className="w-3.5 h-3.5 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); setDateFilter({ start: null, end: null }); }}
                    />
                  )}
                </button>

                {isCalendarOpen && (
                  <div className="absolute top-11 left-0 w-full bg-card border border-border rounded-2xl shadow-xl p-4 z-50">
                    {/* Calendar Nav */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}
                        className="p-1 hover:bg-bg-input rounded text-muted text-xs font-bold"
                      >‹</button>
                      <span className="text-xs font-black text-main">
                        {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}
                        className="p-1 hover:bg-bg-input rounded text-muted text-xs font-bold"
                      >›</button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[0.6rem] font-bold text-muted/30">{d}</div>
                      ))}
                    </div>

                    {/* Day Cells */}
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`}></div>)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isStart = dateFilter.start === dStr;
                        const isEnd = dateFilter.end === dStr;
                        const inRange = dateFilter.start && dateFilter.end && dStr > dateFilter.start && dStr < dateFilter.end;
                        const hasNote = noteDates.has(dStr);
                        const today = new Date();
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                        const isToday = dStr === todayStr;

                        return (
                          <button
                            key={day}
                            onClick={() => selectDay(day)}
                            title={hasNote ? 'Has journal entries' : undefined}
                            className={`aspect-square rounded flex items-center justify-center text-[0.7rem] transition-all font-semibold ${
                              (isStart || isEnd) ? 'bg-primary text-white font-bold' :
                              inRange ? 'bg-primary/10 text-primary font-bold' :
                              hasNote ? 'bg-primary/5 text-primary font-bold hover:bg-primary/10 cursor-pointer' :
                              'hover:bg-bg-input text-muted/30'
                            } ${isToday && !(isStart || isEnd) ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-card' : ''}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => { setDateFilter({ start: null, end: null }); setIsCalendarOpen(false); }}
                      className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 py-1.5 rounded-lg transition-colors"
                    >
                      Clear Range
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes List — Grouped by Date */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
              {groupedNotes.sortedDates.length === 0 ? (
                <div className="flex flex-col items-center py-10 px-5 opacity-60">
                  <BookOpen className="w-10 h-10 text-muted/30 mb-3" />
                  <span className="font-bold text-muted tracking-wide text-sm text-center">
                    {searchQuery || hasActiveFilter ? 'No matching entries.' : 'No entries yet.'}
                  </span>
                </div>
              ) : (
                groupedNotes.sortedDates.map(dateKey => {
                  const isCollapsed = collapsedDates[dateKey];
                  const group = groupedNotes.groups[dateKey];
                  return (
                    <div key={dateKey}>
                      <button
                        onClick={() => toggleDateCollapse(dateKey)}
                        className="w-full flex items-center gap-2 px-5 py-2 hover:bg-bg-input transition-colors group"
                      >
                        {isCollapsed
                          ? <ChevronRight className="w-3.5 h-3.5 text-muted/30" />
                          : <ChevronDown className="w-3.5 h-3.5 text-muted/30" />
                        }
                        <span className="text-[0.62rem] font-black text-muted uppercase tracking-widest">
                          {dateKey}
                        </span>
                        <span className="ml-auto text-[0.6rem] font-bold text-muted bg-bg-input group-hover:bg-card px-1.5 py-0.5 rounded-full transition-colors">
                          {group.length}
                        </span>
                      </button>

                      {!isCollapsed && (
                        <div className="px-3 pb-2 space-y-1.5">
                          {group.map(note => (
                            <div
                              key={note._id}
                              onClick={() => setActiveNote(note)}
                              className={`p-3 rounded-xl cursor-pointer transition-all border group/card relative overflow-hidden ${
                                activeNote?._id === note._id
                                  ? 'bg-primary border-primary shadow-md'
                                  : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-black truncate text-[0.9rem] tracking-tight leading-tight mb-1 ${
                                    activeNote?._id === note._id ? 'text-white' : 'text-main'
                                  }`}>
                                    {note.title || 'Untitled Entry'}
                                  </h3>
                                  <p className={`text-[0.75rem] truncate font-medium leading-snug ${
                                    activeNote?._id === note._id ? 'text-white/70' : 'text-muted'
                                  }`}>
                                    {note.content || 'Empty entry...'}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleDelete(e, note._id)}
                                  className={`p-1 rounded-lg flex-shrink-0 transition-colors ${
                                    activeNote?._id === note._id
                                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                                      : 'text-muted/30 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/card:opacity-100'
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Editor Pane */}
          <div className={`${activeNote ? 'flex' : 'hidden md:flex'} flex-1 bg-card h-full flex-col overflow-y-auto custom-scrollbar relative w-full`}>
            {activeNote ? (
              <div className="max-w-[860px] w-full mx-auto px-6 md:px-12 py-6 md:py-12 flex flex-col min-h-full">
                
                <button onClick={() => setActiveNote(null)} className="md:hidden flex items-center gap-1 text-muted font-bold mb-6 hover:text-primary transition-colors">
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" /> Back to Journals
                </button>

                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                  placeholder="Entry Title"
                  className="text-[2rem] md:text-[2.5rem] font-black text-main placeholder:text-muted/10 outline-none w-full bg-transparent mb-2 transition-colors tracking-tight leading-tight"
                />
                <p className="text-xs md:text-sm text-muted font-semibold mb-6 md:mb-8 pl-1">
                  {activeNote.updatedAt
                    ? new Date(activeNote.updatedAt).toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                    : 'Just now'
                  }
                </p>
                <textarea
                  value={activeNote.content}
                  onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                  placeholder="Start writing your thoughts..."
                  className="flex-1 w-full resize-none outline-none text-[1.05rem] leading-loose font-medium text-main placeholder:text-muted/10 bg-transparent"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-muted/30 opacity-60">
                <div
                  onClick={handleAdd}
                  className="w-24 h-24 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors rounded-full flex items-center justify-center mb-6 border-2 border-primary/20 shadow-sm text-primary hover:text-primary-hover"
                >
                  <Plus className="w-10 h-10" strokeWidth={3} />
                </div>
                <p className="font-bold text-xl text-muted tracking-tight">Create a new journal entry</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Notes;
