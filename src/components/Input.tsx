// src/components/Input.tsx
import React from 'react';

type InputProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => {
  const id = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1 text-gray-700 font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
};

export default Input;
