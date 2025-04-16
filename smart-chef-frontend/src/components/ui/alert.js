import React from 'react';

const Alert = ({ variant, children, className }) => {
  const alertClasses = {
    destructive: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={`p-4 rounded ${alertClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children }) => {
  return <div>{children}</div>;
};

export { Alert, AlertDescription };
