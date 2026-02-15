import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  lists: [{ id: 'personal', name: 'Personal', color: 'red' }],
  activeView: 'my-day',
  loading: false,
  error: null
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action) {
      state.tasks = action.payload;
      state.loading = false;
    },

    clearTasks(state) {
      state.tasks = [];
      state.loading = false;
    },

    addTask(state, action) {
      state.tasks.unshift(action.payload);
      state.loading = false;
    },

    editTask(state, action) {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
      state.loading = false;
    },

    deleteTask(state, action) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      state.loading = false;
    },

    toggleComplete(state, action) {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
      state.loading = false;
    },

    toggleImportant(state, action) {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
      state.loading = false;
    },

    setActiveView(state, action) {
      state.activeView = action.payload;
    },

    addList(state, action) {
      state.lists.push({
        id: `list-${state.lists.length + 1}`,
        name: action.payload,
        color: 'blue'
      });
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },

    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setTasks,
  clearTasks,
  addTask,
  editTask,
  deleteTask,
  toggleComplete,
  toggleImportant,
  setActiveView,
  addList,
  setLoading,
  setError
} = tasksSlice.actions;

export default tasksSlice.reducer;
