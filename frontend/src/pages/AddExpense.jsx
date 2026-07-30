import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import {
  Receipt,
  DollarSign,
  User,
  Users,
  PieChart,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Percent,
  Hash
} from 'lucide-react';

const AddExpense = () => {
  const { id: groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidByUserId, setPaidByUserId] = useState('');
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL | EXACT | PERCENTAGE

  // Participant selections & custom split amounts/percentages
  // Map of userId -> { selected: boolean, amount: string, percentage: string }
  const [participantState, setParticipantState] = useState({});

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const [gRes, mRes] = await Promise.all([
          api.get(`/groups/${groupId}`),
          api.get(`/groups/${groupId}/members`)
        ]);

        if (gRes.success) setGroup(gRes.data);
        if (mRes.success) {
          const mList = mRes.data;
          setMembers(mList);
          setPaidByUserId(user?.id || mList[0]?.id || '');

          // Default select all members for EQUAL split
          const initState = {};
          const defaultPct = (100 / mList.length).toFixed(2);
          mList.forEach((m) => {
            initState[m.id] = {
              selected: true,
              amount: '',
              percentage: defaultPct
            };
          });
          setParticipantState(initState);
        }
      } catch (err) {
        setError("Failed to load group details.");
      } finally {
        setLoadingGroup(false);
      }
    };

    loadGroup();
  }, [groupId, user?.id]);

  const toggleParticipant = (userId) => {
    setParticipantState((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        selected: !prev[userId]?.selected
      }
    }));
  };

  const updateSplitVal = (userId, field, value) => {
    setParticipantState((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  // Compute live validation metrics
  const selectedMembers = members.filter((m) => participantState[m.id]?.selected);
  const numSelected = selectedMembers.length;
  const numTotalAmount = Number(amount) || 0;

  let liveSumExact = 0;
  let liveSumPercentage = 0;

  selectedMembers.forEach((m) => {
    liveSumExact += Number(participantState[m.id]?.amount) || 0;
    liveSumPercentage += Number(participantState[m.id]?.percentage) || 0;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter expense title');
      return;
    }
    if (!amount || numTotalAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }
    if (!paidByUserId) {
      setError('Please select who paid for the expense');
      return;
    }
    if (numSelected === 0) {
      setError('Select at least one participant to split with');
      return;
    }

    // Split Payload Construction & Validation
    const splitsPayload = [];

    if (splitType === 'EQUAL') {
      selectedMembers.forEach((m) => {
        splitsPayload.push({ userId: m.id });
      });
    } else if (splitType === 'EXACT') {
      if (Math.abs(liveSumExact - numTotalAmount) > 0.01) {
        setError(`Sum of custom amounts ($${liveSumExact.toFixed(2)}) must equal total expense ($${numTotalAmount.toFixed(2)})`);
        return;
      }
      selectedMembers.forEach((m) => {
        const amtVal = Number(participantState[m.id]?.amount);
        if (!amtVal || amtVal <= 0) {
          setError(`Please specify a valid amount for ${m.name}`);
          return;
        }
        splitsPayload.push({ userId: m.id, amount: amtVal });
      });
    } else if (splitType === 'PERCENTAGE') {
      if (Math.abs(liveSumPercentage - 100) > 0.01) {
        setError(`Sum of percentages (${liveSumPercentage.toFixed(2)}%) must equal 100%`);
        return;
      }
      selectedMembers.forEach((m) => {
        const pctVal = Number(participantState[m.id]?.percentage);
        if (!pctVal || pctVal <= 0) {
          setError(`Please specify a valid percentage for ${m.name}`);
          return;
        }
        splitsPayload.push({ userId: m.id, percentage: pctVal });
      });
    }

    setSubmitting(true);
    try {
      const res = await api.post('/expenses', {
        groupId: Number(groupId),
        title: title.trim(),
        amount: numTotalAmount,
        category,
        paidByUserId: Number(paidByUserId),
        splitType,
        splits: splitsPayload
      });

      if (res.success) {
        navigate(`/group/${groupId}`);
      } else {
        setError(res.message || 'Failed to add expense');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error adding expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingGroup) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/group/${groupId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {group?.name}</span>
        </Link>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          Group: {group?.name}
        </span>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Add New Expense</h1>
            <p className="text-xs text-slate-400">Split costs equally, by exact amounts, or by percentage</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expense Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner, Taxi, Villa Booking"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Amount ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Paid By & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paid By *
              </label>
              <select
                value={paidByUserId}
                onChange={(e) => setPaidByUserId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === user?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Food">Food & Drinks</option>
                <option value="Transport">Transport & Fuel</option>
                <option value="Stay">Hotel & Stay</option>
                <option value="Groceries">Groceries</option>
                <option value="Shopping">Shopping & Gifts</option>
                <option value="General">General / Other</option>
              </select>
            </div>
          </div>

          {/* Split Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Split Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSplitType('EQUAL')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  splitType === 'EQUAL'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Equal (=)</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitType('EXACT')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  splitType === 'EXACT'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Custom ($)</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitType('PERCENTAGE')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  splitType === 'PERCENTAGE'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Percentage (%)</span>
              </button>
            </div>
          </div>

          {/* Participant Split Breakdown Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Participants ({numSelected} selected)</span>
              {splitType === 'EXACT' && (
                <span className={`font-mono ${Math.abs(liveSumExact - numTotalAmount) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Sum: ${liveSumExact.toFixed(2)} / ${numTotalAmount.toFixed(2)}
                </span>
              )}
              {splitType === 'PERCENTAGE' && (
                <span className={`font-mono ${Math.abs(liveSumPercentage - 100) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Sum: {liveSumPercentage.toFixed(1)}% / 100%
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
              {members.map((m) => {
                const state = participantState[m.id] || { selected: false, amount: '', percentage: '' };
                const equalShare = numSelected > 0 ? (numTotalAmount / numSelected).toFixed(2) : '0.00';

                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      state.selected
                        ? 'bg-slate-900/90 border-slate-700/80'
                        : 'bg-slate-950/40 border-slate-850 opacity-60'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.selected}
                        onChange={() => toggleParticipant(m.id)}
                        className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        {m.name} {m.id === user?.id && '(You)'}
                      </span>
                    </label>

                    {state.selected && (
                      <div className="flex items-center gap-2">
                        {splitType === 'EQUAL' && (
                          <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                            ${equalShare}
                          </span>
                        )}

                        {splitType === 'EXACT' && (
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-mono">$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={state.amount}
                              onChange={(e) => updateSplitVal(m.id, 'amount', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1 pl-6 pr-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}

                        {splitType === 'PERCENTAGE' && (
                          <div className="relative w-24">
                            <span className="absolute right-2.5 top-1.5 text-slate-500 text-xs font-mono">%</span>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="0"
                              value={state.percentage}
                              onChange={(e) => updateSplitVal(m.id, 'percentage', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1 pl-2 pr-6 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              to={`/group/${groupId}`}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-semibold text-xs text-center transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {submitting ? 'Saving Expense...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
