import React from 'react';

export const Button = ({ type, disabled, onClick, onMouseEnter, onMouseLeave, style, children }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;


export const Input = ({ type, value, onChange, placeholder, required, onFocus, onBlur, style }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={style}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

export const Textarea = ({ value, onChange, placeholder, rows, onFocus, onBlur, style }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={style}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

export const Select = ({ value, onChange, onFocus, onBlur, style, children }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      style={style}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </select>
  );
};
