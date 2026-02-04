import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { firebaseAPI } from './App'; // Adjust import path as needed


const Tip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">{text}</div>}
    </div>
  );
};

// --------------------  TASK ITEM  --------------------
export default function TaskItem({ task, dispatch, openPanel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const save = async () => {
    if (!editValue.trim() || editValue === task.title) { setIsEditing(false); return; }
    const updated = await firebaseAPI.updateTask(task.id, { title: editValue.trim() });
    dispatch({ type: 'EDIT_TASK', payload: updated });
    setIsEditing(false);
  };

  const toggleComplete = async e => {
    e.stopPropagation();
    const updated = await firebaseAPI.updateTask(task.id, { completed: !task.completed });
    dispatch({ type: 'TOGGLE_COMPLETE', payload: updated });
  };

  const toggleImportant = async e => {
    e.stopPropagation();
    const updated = await firebaseAPI.updateTask(task.id, { important: !task.important });
    dispatch({ type: 'TOGGLE_IMPORTANT', payload: updated });
  };

  const deleteTask = async e => {
    e.stopPropagation();
    await firebaseAPI.deleteTask(task.id);
    dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  return (
    <div
      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
      onClick={() => openPanel(task.id)}
    >
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={toggleComplete}
          className="w-4 h-4 cursor-pointer"
        />

        {isEditing ? (
          <input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditValue(task.title); setIsEditing(false); } }}
            onBlur={save}
            autoFocus
            className="flex-1 border-b border-blue-500 outline-none text-gray-800"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-3">
        <Tip text={task.important ? 'Remove important' : 'Mark important'}>
          <button onClick={toggleImportant} className="p-1 rounded hover:bg-gray-100">
            <Star className={`w-5 h-5 ${task.important ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
          </button>
        </Tip>

        <Tip text="Edit task">
          <button onClick={e => { e.stopPropagation(); setIsEditing(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            ✏
          </button>
        </Tip>

        <Tip text="Delete task">
          <button onClick={deleteTask} className="p-1 rounded hover:bg-gray-100 text-red-500">
            🗑
          </button>
        </Tip>
      </div>
    </div>
  );
}