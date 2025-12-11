import React, { useState } from 'react';
import { useNavigate } from '../components/Layout';
import { storageService } from '../services/storageService';
import { Lock, Mail, Key } from 'lucide-react';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        await storageService.register(email, password);
      } else {
        await storageService.login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <Lock size={32} />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-slate-500 mb-8">
            {isRegister ? 'Start your financial journey today.' : 'Enter your credentials to access your dashboard.'}
        </p>
        
        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 pl-10 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
              placeholder="Email Address"
            />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-300 pl-10 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
              placeholder="Password"
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-70 mt-2"
          >
            {isLoading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
            <p>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                    onClick={() => { setIsRegister(!isRegister); setError(''); }}
                    className="text-emerald-600 font-semibold hover:underline"
                >
                    {isRegister ? 'Sign In' : 'Register'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;