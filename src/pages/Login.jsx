import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const { login, register } = useApp();
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    if (isLoginTab) {
      const success = await login(username, password);
      setLoading(false);
      if (success) {
        navigate('/');
      }
    } else {
      const success = await register(username, password);
      setLoading(false);
      if (success) {
        setIsLoginTab(true);
        setUsername('');
        setPassword('');
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B1220] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emeraldGreen/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emeraldGreen/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fadeIn space-y-6">
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg p-4 rounded-3xl font-bold shadow-2xl shadow-emeraldGreen/25 text-3xl transition-all duration-300 transform hover:scale-105 select-none">
            💪
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-widest leading-none">
              MUSCLE UP <span className="text-emeraldGreen">CAFÉ</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-2">
              Sales & POS Control System
            </p>
          </div>
        </div>

        {/* Glass Card Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-[0_0_80px_-15px_rgba(34,197,94,0.15)] relative overflow-hidden">
          
          {/* Card Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emeraldGreen to-transparent"></div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-800 pb-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(true);
                setUsername('');
                setPassword('');
              }}
              className={`w-1/2 py-2 text-xs font-black tracking-widest transition-all duration-300 ${
                isLoginTab
                  ? 'text-emeraldGreen border-b-2 border-emeraldGreen'
                  : 'text-slate-500 hover:text-slate-355'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(false);
                setUsername('');
                setPassword('');
              }}
              className={`w-1/2 py-2 text-xs font-black tracking-widest transition-all duration-300 ${
                !isLoginTab
                  ? 'text-emeraldGreen border-b-2 border-emeraldGreen'
                  : 'text-slate-500 hover:text-slate-355'
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <FaUser className="text-xs" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800/80 focus:border-emeraldGreen focus:ring-2 focus:ring-emeraldGreen/10 rounded-2xl text-white text-xs placeholder:text-slate-650 font-bold transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <FaLock className="text-xs" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800/80 focus:border-emeraldGreen focus:ring-2 focus:ring-emeraldGreen/10 rounded-2xl text-white text-xs placeholder:text-slate-650 font-bold transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emeraldGreen hover:bg-emeraldGreenHover disabled:bg-emeraldGreen/50 text-darknavy font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emeraldGreen/15 transition-all duration-200 flex items-center justify-center space-x-2.5 mt-4 cursor-pointer transform hover:-translate-y-[1px] active:translate-y-[1px]"
            >
              {loading ? (
                <span className="animate-spin border-2 border-darknavy border-t-transparent w-4 h-4 rounded-full"></span>
              ) : isLoginTab ? (
                <>
                  <FaSignInAlt className="text-xs" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="text-xs" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
