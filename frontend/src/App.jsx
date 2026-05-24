import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FileDetail from './pages/FileDetail';
import './index.css';

function AppRouter() {
  const { user, loading } = useAuth();
  const [openFile, setOpenFile] = useState(null);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (openFile) {
    return (
      <FileDetail
        file={openFile}
        onBack={() => setOpenFile(null)}
      />
    );
  }

  return <Dashboard onOpenFile={setOpenFile} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
