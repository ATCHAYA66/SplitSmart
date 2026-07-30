import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User, PlusCircle, Users } from 'lucide-react';

const Navbar = ({ onOpenCreateGroup, onOpenJoinGroup }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-card sticky top-0 z-40 border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              SplitSmart
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-teal-400">
              Expense Manager
            </span>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={onOpenCreateGroup}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 text-sm font-medium transition-all"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>New Group</span>
            </button>

            <button
              onClick={onOpenJoinGroup}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-sm font-medium transition-all"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>Join Code</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-full py-1 px-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-semibold text-slate-200 leading-none">
                  {user.name}
                </span>
                <span className="block text-[11px] text-slate-400 leading-tight">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
