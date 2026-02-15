import React, { Suspense, useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import store from './store/store';
import {
  setTasks,
  setLoading,
  clearTasks
} from './store/tasksSlice';

// --------------------  LOADER  --------------------
const Loader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);

// --------------------  LAZY COMPONENTS  --------------------
const AuthScreen = React.lazy(() => import('./components/AuthScreen'));
const Sidebar = React.lazy(() => import('./components/Sidebar'));
const MainContent = React.lazy(() => import('./components/MainContent'));
const TaskPanel = React.lazy(() => import('./components/TaskPanel'));

// --------------------  FIREBASE API (UNCHANGED)  --------------------
export const firebaseAPI = {
  subscribeTasks: (uid, cb) => {
    const q = query(collection(db, 'tasks'), where('userId', '==', uid));
    return onSnapshot(q, snap =>
      cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },

  createTask: async taskData => {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...taskData };
  },

  updateTask: async (id, updates) => {
    const ref = doc(db, 'tasks', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date() });
    return { id, ...updates };
  },

  deleteTask: async id => {
    await deleteDoc(doc(db, 'tasks', id));
    return id;
  }
};

// --------------------  MAIN LAYOUT  --------------------
function MainLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tasks = useSelector(state => state.tasks.tasks);
  const loading = useSelector(state => state.tasks.loading);

  const [panelTaskId, setPanelTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ---------- AUTH ----------
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
      if (!u) navigate('/login');
    });
    return () => unsub();
  }, [navigate]);

  // ---------- TASKS SUBSCRIBE ----------
  useEffect(() => {
    if (!user?.uid) return;

    dispatch(setLoading(true));
    const unsub = firebaseAPI.subscribeTasks(user.uid, data => {
      dispatch(setTasks(data));
    });

    return () => unsub();
  }, [user, dispatch]);

  // ---------- LOGOUT ----------
  const handleLogout = async () => {
    await signOut(getAuth());
    dispatch(clearTasks());
    navigate('/login');
  };

  const openPanel = id => setPanelTaskId(id);
  const closePanel = () => setPanelTaskId(null);

  const panelTask = tasks.find(t => t.id === panelTaskId);

  if (authLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onLogout={handleLogout}
        userEmail={user.email}
      />

      <MainContent
        openPanel={openPanel}
        user={user}
      />

      {panelTask && (
        <TaskPanel
          task={panelTask}
          close={closePanel}
        />
      )}
    </div>
  );
}

// --------------------  APP ROOT  --------------------
function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<AuthScreen />} />
          <Route path="/app/*" element={<MainLayout />} />
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route
            path="*"
            element={
              <div className="flex h-screen items-center justify-center">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Provider>
  );
}

export default App;
