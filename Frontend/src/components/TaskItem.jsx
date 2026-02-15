import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { firebaseAPI } from '../App';
import {
  editTask,
  toggleComplete as toggleCompleteAction,
  toggleImportant as toggleImportantAction,
  deleteTask as deleteTaskAction
} from '../store/tasksSlice';

// ---------- TOOLTIP ----------
const Tip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
          {text}
        </div>
      )}
    </div>
  );
};

// ---------- CONSENT MODAL ----------
const ConsentModal = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <p className="text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- TASK ITEM --------------------
export default function TaskItem({ task, openPanel }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  // State to control consent modal
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentMessage, setConsentMessage] = useState('');
  const [consentAction, setConsentAction] = useState(null);

  // Open consent modal for a given action
  const askConsent = (message, action) => {
    setConsentMessage(message);
    setConsentAction(() => action);
    setConsentOpen(true);
  };

  const handleConfirm = async () => {
    setConsentOpen(false);
    if (consentAction) await consentAction();
  };

  const handleCancel = () => setConsentOpen(false);

  // ---------- TASK ACTIONS ----------
  const save = async () => {
    if (!editValue.trim() || editValue === task.title) {
      setIsEditing(false);
      return;
    }
    const updated = await firebaseAPI.updateTask(task.id, { title: editValue.trim() });
    dispatch(editTask(updated));
    setIsEditing(false);
  };

  const toggleComplete = async e => {
    e.stopPropagation();
    askConsent(
      task.completed ? "Mark this task as active?" : "Mark this task as completed?",
      async () => {
        const updated = await firebaseAPI.updateTask(task.id, { completed: !task.completed });
        dispatch(toggleCompleteAction(updated));
      }
    );
  };

  const toggleImportant = async e => {
    e.stopPropagation();
    askConsent(
      task.important ? "Remove this task from important?" : "Mark this task as important?",
      async () => {
        const updated = await firebaseAPI.updateTask(task.id, { important: !task.important });
        dispatch(toggleImportantAction(updated));
      }
    );
  };

  const deleteTask = async e => {
    e.stopPropagation();
    askConsent(
      "Are you sure you want to delete this task?",
      async () => {
        await firebaseAPI.deleteTask(task.id);
        dispatch(deleteTaskAction(task.id));
      }
    );
  };

  return (
    <>
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
              onKeyDown={e => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') {
                  setEditValue(task.title);
                  setIsEditing(false);
                }
              }}
              onBlur={save}
              autoFocus
              className="flex-1 border-b border-blue-500 outline-none text-gray-800"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span
              className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
            >
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
            <button
              onClick={e => { e.stopPropagation(); setIsEditing(true); }}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
            >
              ✏
            </button>
          </Tip>

          <Tip text="Delete task">
            <button
              onClick={deleteTask}
              className="p-1 rounded hover:bg-gray-100 text-red-500"
            >
              🗑
            </button>
          </Tip>
        </div>
      </div>

      {/* ---------- CONSENT MODAL ---------- */}
      <ConsentModal
        open={consentOpen}
        message={consentMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
