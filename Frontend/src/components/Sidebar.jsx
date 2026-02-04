import React, { useState } from 'react';
import { Sun, Star, Calendar, Inbox, Plus, LogOut } from 'lucide-react';

// Helper component (assumes Tip is exported from App or defined here)
// If Tip is in a separate file, import it instead
const Tip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">{text}</div>}
    </div>
  );
};

// Action type constants (adjust if importing from a constants file)
const SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW';
const ADD_LIST = 'ADD_LIST';

// --------------------  SIDEBAR  --------------------
export default function Sidebar({ state, dispatch, onLogout, userEmail }) {
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const getTaskCount = view => {
    switch (view) {
      case 'my-day':    return state.tasks.filter(t => t.myDay && !t.completed).length;
      case 'important': return state.tasks.filter(t => t.important && !t.completed).length;
      case 'planned':   return state.tasks.filter(t => t.date && !t.completed).length;
      case 'all':       return state.tasks.filter(t => !t.completed).length;
      default:          return state.tasks.filter(t => t.list === view && !t.completed).length;
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      dispatch({ type: ADD_LIST, payload: newListName.trim() });
      setNewListName('');
      setShowCreateList(false);
    }
  };

  const navItems = [
    { id: 'my-day', icon: Sun, label: 'My Day', color: 'blue' },
    { id: 'important', icon: Star, label: 'Important', color: 'gray' },
    { id: 'planned', icon: Calendar, label: 'Planned', color: 'gray' },
    { id: 'all', icon: Inbox, label: 'All Tasks', color: 'gray' }
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">To-Do</h1>
          <p className="text-xs text-gray-500 mt-1">{userEmail}</p>
        </div>
        <Tip text="Logout">
          <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><LogOut className="w-5 h-5 text-gray-600" /></button>
        </Tip>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = state.activeView === item.id;
            const count = getTaskCount(item.id);
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: SET_ACTIVE_VIEW, payload: item.id })}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>{item.label}</span>
                </div>
                {count > 0 && <span className="text-sm text-gray-500">{count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 px-2">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Lists</div>
          <div className="space-y-1">
            {state.lists.map(list => {
              const isActive = state.activeView === list.id;
              const count = getTaskCount(list.id);
              const colorMap = { red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500' };
              return (
                <button
                  key={list.id}
                  onClick={() => dispatch({ type: SET_ACTIVE_VIEW, payload: list.id })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${colorMap[list.color]}`} />
                    <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>{list.name}</span>
                  </div>
                  {count > 0 && <span className="text-sm text-gray-500">{count}</span>}
                </button>
              );
            })}

            {showCreateList ? (
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') setShowCreateList(false); }}
                  onBlur={() => setShowCreateList(false)}
                  placeholder="List name"
                  className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setShowCreateList(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create List</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}