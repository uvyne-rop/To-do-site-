import React, { useState } from 'react';
import { Sun, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { firebaseAPI } from '../App';
import TaskItem from './TaskItem';
import { addTask } from '../store/tasksSlice';
import { setLoading, setError, openPanel } from '../store/uiSlice';

// --------------------  MAIN CONTENT  --------------------
export default function MainContent({ user }) {
  const dispatch = useDispatch();

  // ✅ select UI slice from Redux
  const { loading, error, panelTaskId } = useSelector(state => state.ui);

  // tasks state from Redux
  const tasks = useSelector(state => state.tasks.tasks);
  const lists = useSelector(state => state.tasks.lists);
  const activeView = useSelector(state => state.tasks.activeView);
  const [inputValue, setInputValue] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const getViewTitle = () => {
    if (activeView === 'my-day') return 'My Day';
    if (activeView === 'important') return 'Important';
    if (activeView === 'planned') return 'Planned';
    if (activeView === 'all') return 'All Tasks';
    const list = lists.find(l => l.id === activeView);
    return list ? list.name : 'Tasks';
  };

  const getFilteredTasks = completed =>
    tasks
      .filter(t => t.completed === completed)
      .filter(t => {
        switch (activeView) {
          case 'my-day': return t.myDay;
          case 'important': return t.important;
          case 'planned': return t.date;
          case 'all': return true;
          default: return t.list === activeView;
        }
      });

  const handleAddTask = async () => {
    if (!inputValue.trim()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const taskData = {
        title: inputValue.trim(),
        completed: false,
        important: false,
        myDay: activeView === 'my-day',
        list: ['my-day', 'important', 'planned', 'all'].includes(activeView)
          ? 'personal'
          : activeView,
        userId: user.uid,
        date: null,
        time: null
      };

      const newTask = await firebaseAPI.createTask(taskData);
      dispatch(addTask(newTask));
      setInputValue('');
    } catch (err) {
      console.error('Failed to add task:', err);
      dispatch(setError('Failed to add task'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const activeTasks = getFilteredTasks(false);
  const completedTasks = getFilteredTasks(true);

  const formatDate = () => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const date = new Date();
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl">
          <div className="text-sm text-gray-500 mb-2">{formatDate()}</div>
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
            {activeView === 'my-day' && <Sun className="w-6 h-6 text-yellow-500" />}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a task to your day..."
                disabled={loading}
                className="flex-1 outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
              />
            </div>
          </div>

          {loading && activeTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading tasks...
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {activeTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    openPanel={id => dispatch(openPanel(id))}
                  />
                ))}
              </div>

              {completedTasks.length > 0 && (
                <div className="mt-8">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-3"
                  >
                    {showCompleted
                      ? <ChevronDown className="w-4 h-4"/>
                      : <ChevronRight className="w-4 h-4"/>}
                    <span>Completed ({completedTasks.length})</span>
                  </button>

                  {showCompleted && (
                    <div className="space-y-2">
                      {completedTasks.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          openPanel={id => dispatch(openPanel(id))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTasks.length === 0 && completedTasks.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No tasks yet. Add one above to get started!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
