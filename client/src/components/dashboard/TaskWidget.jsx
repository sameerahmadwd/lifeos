import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

const TaskWidget = ({ tasks, setTasks }) => {
  const [newTask, setNewTask] = useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-[500px] hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Today's Tasks</h2>
      </div>

      <form onSubmit={addTask} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-12 h-12 opacity-20" />
            <p className="font-medium text-sm">All caught up for today!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                task.completed 
                  ? 'bg-slate-50 border-transparent' 
                  : 'bg-white border-slate-100 hover:border-indigo-100'
              }`}
              onClick={() => toggleTask(task.id)}
            >
              <div 
                className="flex items-center gap-3 flex-1"
              >
                <div className={`transition-colors duration-200 ${task.completed ? 'text-indigo-500' : 'text-slate-300 group-hover:text-indigo-300'}`}>
                  {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium transition-all duration-200 ${
                  task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                }`}>
                  {task.text}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskWidget;
