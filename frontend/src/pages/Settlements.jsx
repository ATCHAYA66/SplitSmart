import React, { useEffect, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/BalanceCard';
import SettleModal from '../components/SettleModal';
import api from '../api/axiosInstance';
import { Scale, ArrowUpDown, CheckCircle2, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settlements = () => {
  const { user } = useAuth();
  const { groups, userExpenses, fetchGroups, fetchUserExpenses } = useExpenses();

  const [groupBalancesMap, setGroupBalancesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedGroupForSettle, setSelectedGroupForSettle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillSuggestion, setPrefillSuggestion] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchUserExpenses();
  }, [fetchGroups, fetchUserExpenses]);

  useEffect(() => {
    const loadAllBalances = async () => {
      if (groups.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const balMap = {};
        for (const g of groups) {
          const res = await api.get(`/settlements/group/${g.id}/balances`);
          const sugRes = await api.get(`/settlements/group/${g.id}/suggestions`);
          const mRes = await api.get(`/groups/${g.id}/members`);

          if (res.success) {
            balMap[g.id] = {
              balances: res.data,
              suggestions: sugRes.success ? sugRes.data : [],
              members: mRes.success ? mRes.data : []
            };
          }
        }
        setGroupBalancesMap(balMap);
      } catch (err) {
        console.error("Failed to load balances across groups:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllBalances();
  }, [groups]);

  // Compute total owed to you and total you owe
  let totalOwedToYou = 0;
  let totalYouOwe = 0;

  userExpenses.forEach((exp) => {
    const isPaidByMe = exp.paidBy?.id === user?.id;
    const mySplit = exp.splits?.find((s) => s.user?.id === user?.id);
    const myAmount = mySplit ? Number(mySplit.amount) : 0;

    if (isPaidByMe) {
      totalOwedToYou += Number(exp.amount) - myAmount;
    } else if (mySplit) {
      totalYouOwe += myAmount;
    }
  });

  const triggerSettleModal = (groupId, suggestion) => {
    setSelectedGroupForSettle(groupId);
    setPrefillSuggestion(suggestion);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Settlements & Balances</h1>
            <p className="text-xs text-slate-400">View overall debts, credits, and optimal minimum payments</p>
          </div>
        </div>
      </div>

      {/* Financial Position */}
      <BalanceCard totalOwedToYou={totalOwedToYou} totalYouOwe={totalYouOwe} />

      {/* Balances by Group */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <span>Group Debts & Settlement Suggestions</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 text-xs text-slate-400">
            No groups found. Join or create a group to view balances.
          </div>
        ) : (
          groups.map((group) => {
            const gData = groupBalancesMap[group.id];
            const myBalObj = gData?.balances?.find((b) => b.user?.id === user?.id);
            const myNet = myBalObj ? Number(myBalObj.netBalance) : 0;
            const suggestions = gData?.suggestions || [];

            return (
              <div key={group.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <Link to={`/group/${group.id}`} className="text-lg font-bold text-slate-100 hover:text-indigo-400 transition flex items-center gap-2">
                      <span>{group.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </Link>
                    <span className="text-xs text-slate-400 font-mono">Join Code: {group.joinCode}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Your Position</span>
                    <span className={`text-sm font-extrabold font-mono ${
                      myNet > 0 ? 'text-emerald-400' : myNet < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {myNet > 0 ? `+${myNet.toFixed(2)} (Gets back)` : myNet < 0 ? `-${Math.abs(myNet).toFixed(2)} (Owes)` : '$0.00 (Settled)'}
                    </span>
                  </div>
                </div>

                {/* Suggestions for this group */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Minimum Transaction Suggestions
                  </h4>
                  {suggestions.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>No pending settlements required for {group.name}. All balances clean!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggestions.map((s, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-300 font-medium">
                              <strong className="text-rose-400">{s.fromUser?.name}</strong> pays{' '}
                              <strong className="text-emerald-400">{s.toUser?.name}</strong>
                            </span>
                            <span className="block font-mono font-bold text-slate-100 mt-0.5">
                              ${Number(s.amount).toFixed(2)}
                            </span>
                          </div>

                          <button
                            onClick={() => triggerSettleModal(group.id, s)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition shadow"
                          >
                            Settle Now
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Settle Modal */}
      {selectedGroupForSettle && (
        <SettleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          groupId={selectedGroupForSettle}
          members={groupBalancesMap[selectedGroupForSettle]?.members || []}
          prefill={prefillSuggestion}
          onSuccess={() => {
            fetchGroups();
            fetchUserExpenses();
          }}
        />
      )}
    </div>
  );
};

export default Settlements;
