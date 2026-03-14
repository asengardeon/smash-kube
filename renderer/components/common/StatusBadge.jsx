import React from 'react';

export const StatusBadge = ({ status, reason }) => {
  let color = 'bg-gray-700 text-gray-300';
  const s = status || '';
  const r = reason || '';
  
  if (['Running', 'Succeeded', 'Ready', 'Active', 'Bound'].includes(s)) color = 'bg-green-900/50 text-green-400 border border-green-800';
  if (['Pending', 'ContainerCreating'].includes(s)) color = 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
  if (['Failed', 'Error', 'CrashLoopBackOff', 'Terminating', 'NotReady', 'OOMKilled', 'ImagePullBackOff'].includes(s) || ['Error', 'CrashLoopBackOff', 'OOMKilled', 'ImagePullBackOff'].includes(r)) color = 'bg-red-900/50 text-red-400 border border-red-800';
  
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${color}`}>{s}</span>
      {r && r !== s && <span className="text-[9px] text-red-400 font-mono italic">{r}</span>}
    </div>
  );
};
