import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { firebaseAPI } from '../App'; 
import {
  editTask,
  toggleComplete as toggleCompleteAction,
  toggleImportant as toggleImportantAction,
  deleteTask as deleteTaskAction
} from '../store/tasksSlice';

// --------------------  TASK PANEL  --------------------
export default function TaskPanel({ task, close }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(task.title);

  const saveTitle = async () => {
    if (!title.trim() || title === task.title) return;
    const updated = await firebaseAPI.updateTask(task.id, { title });
    dispatch(editTask(updated));
  };

  const toggleComplete = async () => {
    const updated = await firebaseAPI.updateTask(task.id, {
      completed: !task.completed
    });
    dispatch(toggleCompleteAction(updated));
  };

  const toggleImportant = async () => {
    const updated = await firebaseAPI.updateTask(task.id, {
      important: !task.important
    });
    dispatch(toggleImportantAction(updated));
  };

  const deleteTask = async () => {
    await firebaseAPI.deleteTask(task.id);
    dispatch(deleteTaskAction(task.id));
    close();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={close}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Task Details</h2>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-800"
          >
            <X />
          </button>
        </div>

        <label className="block mb-2 text-sm text-gray-600">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={e => e.key === 'Enter' && saveTitle()}
          className="w-full border-b text-lg outline-none mb-6"
          autoFocus
        />

        <div className="space-y-2">
          <button
            onClick={toggleComplete}
            className="w-full border p-2 rounded hover:bg-gray-50"
          >
            {task.completed ? 'Mark Active' : 'Mark Done'}
          </button>

          <button
            onClick={toggleImportant}
            className="w-full border p-2 rounded hover:bg-gray-50"
          >
            {task.important ? 'Remove Important' : 'Mark Important ⭐'}
          </button>

          <button
            onClick={deleteTask}
            className="w-full border p-2 rounded text-red-600 hover:bg-red-50"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
