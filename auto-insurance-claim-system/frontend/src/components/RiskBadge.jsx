import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

const RiskBadge = ({ riskLevel, score }) => {
  const level = riskLevel?.toUpperCase() || 'LOW';

  const getConfig = () => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'badge-low',
          icon: <ShieldCheck size={14} className="text-emerald-600" />,
          label: 'Low Risk'
        };
      case 'MEDIUM':
        return {
          bg: 'badge-medium',
          icon: <AlertTriangle size={14} className="text-amber-600" />,
          label: 'Medium Risk'
        };
      case 'HIGH':
        return {
          bg: 'badge-high',
          icon: <AlertOctagon size={14} className="text-rose-600" />,
          label: 'High Risk'
        };
      default:
        return {
          bg: 'badge-low',
          icon: <ShieldCheck size={14} />,
          label: level
        };
    }
  };

  const config = getConfig();

  return (
    <span className={`badge ${config.bg} flex items-center gap-1.5`}>
      {config.icon}
      <span>{config.label}</span>
      {score !== undefined && score !== null && (
        <span className="font-mono text-xs opacity-80">({score}/100)</span>
      )}
    </span>
  );
};

export default RiskBadge;
