// src/components/Button.tsx
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    type="button"
    className={
      `px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 ` +
      `bg-blue-600 hover:bg-blue-700 text-white ` +
      (className ?? '')
    }
    {...props}
  >
    {children}
  </button>
);

export default Button;
