import React, { useEffect, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import GroupCard from '../components/GroupCard';
import BalanceCard from '../components/BalanceCard';
import ExpenseCard from '../components/ExpenseCard';
import { PlusCircle, Users, Receipt, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = ({ onOpenCreateGroup, onOpenJoinGroup }) => {
  const { user } = useAuth();
  const { groups, userExpenses, fetchGroups, fetchUserExpenses } = useExpenses();

  useEffect(() => {
    fetchGroups();
    fetchUserExpenses();
  }, [fetchGroups, fetchUserExpenses]);

  // Compute total owed to you and total you owe across expenses
  let totalOwedToYou = 0;
  let totalYouOwe = 0;

  userExpenses.forEach((exp) => {
    const isPaidByMe = exp.paidBy?.id === user?.id;
    const mySplit = exp.splits?.find((s) => s.user?.id === user?.id);
    const myAmount = mySplit ? Number(mySplit.amount) : 0;

    if (isPaidByMe) {
      // You paid total. Amount owed to you is total - your share
      totalOwedToYou += Number(exp.amount) - myAmount;
    } else if (mySplit) {
      // Someone else paid, you owe your share
      totalYouOwe += myAmount;
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hello, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your shared group expenses, monitor balances, and settle up transactions easily.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateGroup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Group</span>
          </button>
          <button
            onClick={onOpenJoinGroup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-semibold text-xs transition-all"
          >
            <Users className="w-4 h-4 text-teal-400" />
            <span>Join Group</span>
          </button>
        </div>
      </div>

      {/* Financial Position Balance Cards */}
      <BalanceCard totalOwedToYou={totalOwedToYou} totalYouOwe={totalYouOwe} />

      {/* My Groups Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>My Active Groups</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          </span>
        </div>

        {groups.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">No Groups Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Create a new group for your trip or housemates, or enter a join code to join an existing group.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onOpenCreateGroup}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Create First Group
              </button>
              <button
                onClick={onOpenJoinGroup}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Enter Join Code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Expenses Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-400" />
            <span>Recent Activity & Expenses</span>
          </h2>
          <Link
            to="/settlements"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            <span>View All Balances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {userExpenses.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-slate-400 text-xs border border-slate-800/80">
            No expenses logged yet. Select a group and click "Add Expense" to start splitting!
          </div>
        ) : (
          <div className="space-y-3">
            {userExpenses.slice(0, 6).map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
