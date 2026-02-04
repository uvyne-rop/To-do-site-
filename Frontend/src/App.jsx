import React, { Suspense, useReducer, useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore";

// Loader Component
const Loader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);

// Lazy Loaded Components
const AuthScreen = React.lazy(() => import('./components/AuthScreen'));
const Sidebar = React.lazy(() => import('./components/Sidebar'));
const MainContent = React.lazy(() => import('./components/MainContent'));
const TaskPanel = React.lazy(() => import('./components/TaskPanel'));

// --------------------  INITIAL STATE  --------------------
const initialState = {
  tasks: [],
  lists: [{ id: 'personal', name: 'Personal', color: 'red' }],
  activeView: 'my-day',
  loading: false,
  error: null
};

// --------------------  ACTION TYPES  --------------------
export const SET_TASKS = 'SET_TASKS';
export const ADD_TASK = 'ADD_TASK';
export const EDIT_TASK = 'EDIT_TASK';
export const DELETE_TASK = 'DELETE_TASK';
export const TOGGLE_COMPLETE = 'TOGGLE_COMPLETE';
export const TOGGLE_IMPORTANT = 'TOGGLE_IMPORTANT';
export const SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW';
export const ADD_LIST = 'ADD_LIST';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

// --------------------  REDUCER  --------------------
function appReducer(state, action) {
  switch (action.type) {
    case SET_TASKS: return { ...state, tasks: action.payload, loading: false };
    case ADD_TASK: return { ...state, tasks: [action.payload, ...state.tasks], loading: false };
    case EDIT_TASK: return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t), loading: false };
    case DELETE_TASK: return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload), loading: false };
    case TOGGLE_COMPLETE: return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t), loading: false };
    case TOGGLE_IMPORTANT: return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t), loading: false };
    case SET_ACTIVE_VIEW: return { ...state, activeView: action.payload };
    case ADD_LIST: return { ...state, lists: [...state.lists, { id: `list-${state.lists.length + 1}`, name: action.payload, color: 'blue' }] };
    case SET_LOADING: return { ...state, loading: action.payload };
    case SET_ERROR: return { ...state, error: action.payload, loading: false };
    default: return state;
  }
}

// --------------------  FIREBASE API  --------------------
export const firebaseAPI = {
  subscribeTasks: (uid, cb) => {
    const q = query(collection(db, 'tasks'), where('userId', '==', uid));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },
  createTask: async (taskData) => {
    const docRef = await addDoc(collection(db, 'tasks'), { ...taskData, createdAt: new Date(), updatedAt: new Date() });
    return { id: docRef.id, ...taskData };
  },
  updateTask: async (id, updates) => {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, { ...updates, updatedAt: new Date() });
    return { id, ...updates };
  },
  deleteTask: async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
    return id;
  }
};

// --------------------  TINY TOOLTIP  --------------------
export const Tip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">{text}</div>}
    </div>
  );
};

// --------------------  MAIN LAYOUT COMPONENT  --------------------
function MainLayout() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [panelTaskId, setPanelTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Auth State
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
      if (!u) navigate('/login');
    });
    return () => unsubscribe();
  }, [navigate]);

  // Tasks Loader
  useEffect(() => {
    if (!user?.uid) return;
    dispatch({ type: SET_LOADING, payload: true });
    const unsub = firebaseAPI.subscribeTasks(user.uid, tasks => {
      dispatch({ type: SET_TASKS, payload: tasks });
    });
    return () => unsub();
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    dispatch({ type: SET_TASKS, payload: [] });
    navigate('/login');
  };

  const closePanel = () => setPanelTaskId(null);
  const openPanel = id => setPanelTaskId(id);

  const panelTask = state.tasks.find(t => t.id === panelTaskId);

  if (authLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        state={state}
        dispatch={dispatch}
        onLogout={handleLogout}
        userEmail={user?.email}
      />
      <MainContent
        state={state}
        dispatch={dispatch}
        openPanel={openPanel}
        user={user}
      />
      {panelTask && (
        <TaskPanel
          task={panelTask}
          dispatch={dispatch}
          close={closePanel}
        />
      )}
    </div>
  );
}

// --------------------  MAIN APP  --------------------
function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Auth Route - Login/Register */}
        <Route path="/login" element={<AuthScreen />} />

        {/* Main App Routes with Sidebar Layout */}
        <Route path="/app/*" element={<MainLayout />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* 404 */}
        <Route path="*" element={<div className="flex h-screen items-center justify-center">404 - Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
}

export default App;