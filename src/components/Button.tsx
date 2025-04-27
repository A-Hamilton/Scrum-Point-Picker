// src/components/Button.jsx
import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-blue-600 text-white px-4 py-2 rounded-md 
               hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300
               ${className}`}
  >
    {children}
  </button>
);

export default Button;
