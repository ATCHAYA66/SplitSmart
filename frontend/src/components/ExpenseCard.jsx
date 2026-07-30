import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Receipt, Calendar, User, Trash2, PieChart, Users, ChevronDown, ChevronUp } from 'lucide-react';

const ExpenseCard = ({ expense, onDelete }) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const isPaidByMe = expense.paidBy?.id === user?.id;
  const mySplit = expense.splits?.find(s => s.user?.id === user?.id);
  const myAmount = mySplit ? Number(mySplit.amount) : 0;

  // Formatting date
  const formattedDate = new Date(expense.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left icon & Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-100 truncate">
              {expense.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Paid by <strong className={isPaidByMe ? 'text-indigo-300 font-semibold' : 'text-slate-300'}>{isPaidByMe ? 'You' : expense.paidBy?.name}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-slate-500" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] uppercase font-semibold">
                {expense.splitType}
              </span>
            </div>
          </div>
        </div>

        {/* Right Amount & Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-base font-bold text-slate-100 font-mono">
              ${Number(expense.amount).toFixed(2)}
            </div>
            {mySplit ? (
              <div className={`text-xs font-semibold ${
                isPaidByMe
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}>
                {isPaidByMe
                  ? `You lent $${(Number(expense.amount) - myAmount).toFixed(2)}`
                  : `You owe $${myAmount.toFixed(2)}`}
              </div>
            ) : (
              <div className="text-xs text-slate-500">Not involved</div>
            )}
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            title="Toggle split breakdown"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {onDelete && (isPaidByMe || expense.paidBy?.id === user?.id) && (
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
              title="Delete expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Split Breakdown */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 bg-slate-900/40 -mx-4 -mb-4 p-4 rounded-b-2xl">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Split Participants Breakdown ({expense.splits?.length})
            </span>
            <span className="text-[11px] font-mono text-slate-500">Total: ${Number(expense.amount).toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {expense.splits?.map((split) => {
              const isMe = split.user?.id === user?.id;
              return (
                <div
                  key={split.id || split.user?.id}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                    isMe
                      ? 'bg-indigo-950/30 border-indigo-500/30 font-medium'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {split.user?.name?.charAt(0)}
                    </div>
                    <span className="truncate">{split.user?.name} {isMe && '(You)'}</span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="font-bold text-slate-100">${Number(split.amount).toFixed(2)}</span>
                    {split.percentage && (
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {Number(split.percentage).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
