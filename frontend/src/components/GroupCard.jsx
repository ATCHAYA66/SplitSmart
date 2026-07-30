import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Copy, Check, ChevronRight, Tag } from 'lucide-react';

const GroupCard = ({ group }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(group.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'travel':
      case 'trip':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'flatmates':
      case 'home':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'event':
      case 'party':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <Link
      to={`/group/${group.id}`}
      className="glass-card glass-card-hover rounded-2xl p-5 block border border-slate-800/80 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(group.category)}`}>
            <Tag className="w-3 h-3" />
            {group.category || 'General'}
          </span>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
            {group.name}
          </h3>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-600/20 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {group.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {group.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</span>
        </div>

        <button
          onClick={copyCode}
          title="Click to copy join code"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white font-mono text-[11px] transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>{group.joinCode}</span>
            </>
          )}
        </button>
      </div>
    </Link>
  );
};

export default GroupCard;
