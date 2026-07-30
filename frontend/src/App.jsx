import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CreateGroupModal from './components/CreateGroupModal';
import JoinGroupModal from './components/JoinGroupModal';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import AddExpense from './pages/AddExpense';
import Settlements from './pages/Settlements';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Layout = ({ children, onOpenCreateGroup, onOpenJoinGroup }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar onOpenCreateGroup={onOpenCreateGroup} onOpenJoinGroup={onOpenJoinGroup} />
      <div className="flex flex-1">
        <Sidebar onOpenCreateGroup={onOpenCreateGroup} onOpenJoinGroup={onOpenJoinGroup} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                onOpenJoinGroup={() => setIsJoinGroupOpen(true)}
              >
                <Dashboard
                  onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                  onOpenJoinGroup={() => setIsJoinGroupOpen(true)}
                />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/group/:id"
          element={
            <ProtectedRoute>
              <Layout
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                onOpenJoinGroup={() => setIsJoinGroupOpen(true)}
              >
                <GroupDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/group/:id/add-expense"
          element={
            <ProtectedRoute>
              <Layout
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                onOpenJoinGroup={() => setIsJoinGroupOpen(true)}
              >
                <AddExpense />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settlements"
          element={
            <ProtectedRoute>
              <Layout
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                onOpenJoinGroup={() => setIsJoinGroupOpen(true)}
              >
                <Settlements />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />
      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
      />
    </>
  );
};

export default App;
