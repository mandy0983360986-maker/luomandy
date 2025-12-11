import React, { useEffect, useState } from 'react';
import Layout, { RouterContext } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Stocks from './pages/Stocks';
import Login from './pages/Login';
import { storageService } from './services/storageService';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    const handleHashChange = () => {
      let path = window.location.hash.replace('#', '');
      if (!path) path = '/';
      setCurrentPath(path);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  useEffect(() => {
    const unsubscribe = storageService.observeAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-slate-500">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-slate-200 rounded-full mb-2"></div>
            Loading Financial Data...
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!user) {
        return <Login />;
    }

    if (currentPath === '/login') {
        // Redirect to home if logged in
        setTimeout(() => navigate('/'), 0);
        return null;
    }

    switch (currentPath) {
        case '/': return <Layout><Dashboard /></Layout>;
        case '/accounts': return <Layout><Accounts /></Layout>;
        case '/transactions': return <Layout><Transactions /></Layout>;
        case '/stocks': return <Layout><Stocks /></Layout>;
        default: return <Layout><Dashboard /></Layout>;
    }
  };

  return (
    <RouterContext.Provider value={{ path: currentPath, navigate }}>
      {renderContent()}
    </RouterContext.Provider>
  );
};

export default App;