import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={{
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '1rem',
      margin: '0 2rem 1rem',
      borderRadius: '0.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>{message}</span>
      <button
        onClick={onRetry}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorMessage;
