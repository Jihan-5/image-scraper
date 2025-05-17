import React from 'react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => {
  const colors = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className={`p-4 rounded-md ${colors[type]}`}>
      {message}
    </div>
  );
};