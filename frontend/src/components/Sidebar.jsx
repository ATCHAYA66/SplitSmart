import React from 'react';
import { NavLink } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { LayoutDashboard, Users, Receipt, ArrowUpDown, Plus, Key } from 'lucide-react';

const Sidebar = ({ onOpenCreateGroup, onOpenJoinGroup }) => {
  const { groups } = useExpenses();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/settlements', label: 'Settlements & Balances', icon: ArrowUpDown },
  ];

  return (
    <aside className="w-64 glass-card border-r border-slate-800 p-4 hidden md:flex flex-col gap-6 shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          <span>My Groups ({groups.length})</span>
          <button
            onClick={onOpenCreateGroup}
            title="Create Group"
            className="p-1 rounded-md hover:bg-indigo-500/20 text-indigo-400 transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/60">
            No groups joined yet
          </div>
        ) : (
          groups.map((group) => (
            <NavLink
              key={group.id}
              to={`/group/${group.id}`}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600/25 text-indigo-200 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">{group.name}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                {group.memberCount}
              </span>
            </NavLink>
          ))
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        <button
          onClick={onOpenCreateGroup}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Group</span>
        </button>
        <button
          onClick={onOpenJoinGroup}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-medium text-xs transition-all"
        >
          <Key className="w-3.5 h-3.5 text-teal-400" />
          <span>Join with Code</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
