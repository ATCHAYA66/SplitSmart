import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { X, CheckCircle, ArrowRight, DollarSign } from 'lucide-react';

const SettleModal = ({ isOpen, onClose, groupId, members = [], prefill, onSuccess }) => {
  const [payerId, setPayerId] = useState(prefill?.fromUser?.id || '');
  const [payeeId, setPayeeId] = useState(prefill?.toUser?.id || '');
  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount) : '');
  const [notes, setNotes] = useState('Payment settlement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!payerId || !payeeId) {
      setError('Please select both payer and payee');
      return;
    }
    if (payerId === payeeId) {
      setError('Payer and Payee cannot be the same user');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/settlements', {
        groupId: Number(groupId),
        payerId: Number(payerId),
        payeeId: Number(payeeId),
        amount: Number(amount),
        notes
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to record settlement');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error recording settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-slate-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Settle Up Payment</h3>
            <p className="text-xs text-slate-400">Record a direct cash/digital transfer payment</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Payer (Sender)
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select Payer</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Payee (Recipient)
              </label>
              <select
                value={payeeId}
                onChange={(e) => setPayeeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select Payee</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-7 pr-3 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. GPay / Cash payment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleModal;
