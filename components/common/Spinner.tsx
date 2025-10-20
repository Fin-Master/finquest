import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'white';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'indigo' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    indigo: 'border-t-indigo-500 border-r-indigo-500 border-b-gray-700 border-l-gray-700',
    white: 'border-t-white border-r-white border-b-transparent border-l-transparent',
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}></div>
  );
};

export default Spinner;