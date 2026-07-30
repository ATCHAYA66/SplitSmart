import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import ExpenseCard from '../components/ExpenseCard';
import SettleModal from '../components/SettleModal';
import {
  Users,
  PlusCircle,
  Receipt,
  Scale,
  ArrowUpDown,
  Copy,
  Check,
  Tag,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const GroupDetail = () => {
  const { id: groupId } = useParams();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);

  const [activeTab, setActiveTab] = useState('expenses'); // expenses | balances | suggestions | members
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [prefillSettlement, setPrefillSettlement] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchGroupData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [groupRes, membersRes, expensesRes, balancesRes, suggestionsRes, historyRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/members`),
        api.get(`/expenses/group/${groupId}`),
        api.get(`/settlements/group/${groupId}/balances`),
        api.get(`/settlements/group/${groupId}/suggestions`),
        api.get(`/settlements/group/${groupId}/history`)
      ]);

      if (groupRes.success) setGroup(groupRes.data);
      if (membersRes.success) setMembers(membersRes.data);
      if (expensesRes.success) setExpenses(expensesRes.data);
      if (balancesRes.success) setBalances(balancesRes.data);
      if (suggestionsRes.success) setSuggestions(suggestionsRes.data);
      if (historyRes.success) setSettlementHistory(historyRes.data);
    } catch (err) {
      console.error("Failed to load group details:", err);
      setError(err.response?.data?.message || err.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await api.delete(`/expenses/${expenseId}`);
      if (res.success) {
        fetchGroupData();
      }
    } catch (err) {
      alert("Failed to delete expense: " + (err.response?.data?.message || err.message));
    }
  };

  const openSettleWithPrefill = (suggestion) => {
    setPrefillSettlement(suggestion);
    setIsSettleModalOpen(true);
  };

  const copyJoinCode = () => {
    if (group?.joinCode) {
      navigator.clipboard.writeText(group.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Calculate total group expenditure
  const totalGroupSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto my-12 border border-rose-500/30 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-100">Unable to load group</h3>
        <p className="text-xs text-slate-400">{error || 'Group not found'}</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Group Banner Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {group.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Code: <strong className="text-slate-200">{group.joinCode}</strong>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {group.name}
          </h1>

          {group.description && (
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {group.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {members.length} members
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-teal-400" />
              Total Spent: <strong className="text-slate-100 font-mono">${totalGroupSpent.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={copyJoinCode}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-mono text-xs transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Join Code'}</span>
          </button>

          <Link
            to={`/group/${groupId}/add-expense`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'expenses'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'balances'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Member Balances</span>
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'suggestions'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Settle Up Suggestions ({suggestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'members'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members ({members.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Expense History</h3>
            <Link
              to={`/group/${groupId}/add-expense`}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Expense</span>
            </Link>
          </div>

          {expenses.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-3">
              <Receipt className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No expenses recorded yet</p>
              <p className="text-xs text-slate-500">Click "Add Expense" above to record dinner, transport, or groceries.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onDelete={handleDeleteExpense}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Balances */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Member Net Balances</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map((b) => {
              const net = Number(b.netBalance);
              const isMe = b.user?.id === user?.id;
              return (
                <div
                  key={b.user?.id}
                  className={`glass-card rounded-2xl p-5 border ${
                    net > 0
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : net < 0
                      ? 'border-rose-500/30 bg-rose-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm">
                        {b.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-100">
                          {b.user?.name} {isMe && '(You)'}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.user?.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Status</span>
                    <span className={`text-base font-extrabold font-mono ${
                      net > 0 ? 'text-emerald-400' : net < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {net > 0 ? `Gets back $${net.toFixed(2)}` : net < 0 ? `Owes $${Math.abs(net).toFixed(2)}` : 'Settled up'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 3: Settlement Suggestions (Min-Transactions Algorithm) */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-indigo-950/10 flex items-start gap-3">
            <Scale className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-indigo-300 font-semibold block mb-0.5">Optimized Settlement Suggestions</strong>
              Our minimum-transactions algorithm computes the exact fewest payments required to resolve all debt balances within the group. Click "Settle Now" to record a payment.
            </div>
          </div>

          {suggestions.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-100">All Balances Settled Up!</h4>
              <p className="text-xs text-slate-400">No outstanding debts remaining in this group.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((s, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">
                      <strong className="text-rose-400 font-semibold">{s.fromUser?.name}</strong> pays{' '}
                      <strong className="text-emerald-400 font-semibold">{s.toUser?.name}</strong>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-slate-100">
                      ${Number(s.amount).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => openSettleWithPrefill(s)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition shrink-0"
                  >
                    Settle Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Settlement History */}
          {settlementHistory.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-slate-300">Recent Group Settlements History</h4>
              <div className="space-y-2">
                {settlementHistory.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        <strong className="text-slate-200">{s.payer?.name}</strong> paid{' '}
                        <strong className="text-slate-200">{s.payee?.name}</strong>: {s.notes}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      ${Number(s.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Group Members</h3>
            <button
              onClick={copyJoinCode}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Join Code: {group.joinCode}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <div key={m.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow">
                  {m.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100">
                    {m.name} {m.id === user?.id && '(You)'}
                  </div>
                  <div className="text-xs text-slate-400">{m.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlement Payment Modal */}
      <SettleModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        groupId={groupId}
        members={members}
        prefill={prefillSettlement}
        onSuccess={fetchGroupData}
      />
    </div>
  );
};

export default GroupDetail;
