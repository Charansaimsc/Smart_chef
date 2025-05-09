import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div className={`shadow-lg rounded-lg overflow-hidden bg-white ${className}`}>
      {children}
    </div>
  );
};

export default Card;