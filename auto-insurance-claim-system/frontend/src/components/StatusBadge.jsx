import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch (s?.toUpperCase()) {
      case 'SUBMITTED': return 'badge-submitted';
      case 'UNDER_AGENT_REVIEW': return 'badge-agent';
      case 'DOCUMENTS_PENDING': return 'badge-pending';
      case 'UNDER_ASSESSMENT': return 'badge-officer';
      case 'UNDER_INVESTIGATION': return 'badge-investigation';
      case 'UNDER_OFFICER_REVIEW': return 'badge-officer';
      case 'APPROVED': return 'badge-approved';
      case 'SETTLED': return 'badge-settled';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-submitted';
    }
  };

  const formatText = (s) => {
    if (!s) return 'UNKNOWN';
    return s.replace(/_/g, ' ');
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
