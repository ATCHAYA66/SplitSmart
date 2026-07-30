import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';

const BalanceCard = ({ totalOwedToYou = 0, totalYouOwe = 0 }) => {
  const netBalance = Number(totalOwedToYou) - Number(totalYouOwe);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Owed To You */}
      <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            You are owed
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-emerald-400 font-mono">
          ${Number(totalOwedToYou).toFixed(2)}
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Total money to receive
        </span>
      </div>

      {/* Total You Owe */}
      <div className="glass-card rounded-2xl p-4 border border-rose-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            You owe
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-rose-400 font-mono">
          ${Number(totalYouOwe).toFixed(2)}
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Total money to pay back
        </span>
      </div>

      {/* Net Total */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Net Balance
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl font-extrabold font-mono ${
          netBalance > 0 ? 'text-emerald-400' : netBalance < 0 ? 'text-rose-400' : 'text-slate-300'
        }`}>
          {netBalance > 0 ? `+$${netBalance.toFixed(2)}` : netBalance < 0 ? `-$${Math.abs(netBalance).toFixed(2)}` : '$0.00'}
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Overall financial position
        </span>
      </div>
    </div>
  );
};

export default BalanceCard;
