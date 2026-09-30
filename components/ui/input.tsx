import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="form-field">
      {label && <label>{label}</label>}
      <input className={`form-input ${className}`} {...props} />
      {error && <span style={{ color: "var(--red)", fontSize: "10px" }}>{error}</span>}
    </div>
  );
}
