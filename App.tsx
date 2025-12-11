import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Stocks from './pages/Stocks';
import Login from './pages/Login';
import { storageService } from './services/storageService';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = storageService.getUser();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/accounts" element={
          <PrivateRoute>
            <Accounts />
          </PrivateRoute>
        } />
        
        <Route path="/transactions" element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        } />
        
        <Route path="/stocks" element={
          <PrivateRoute>
            <Stocks />
          </PrivateRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
