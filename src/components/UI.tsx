// src/components/UI.tsx
import { forwardRef } from 'react';
// FIX: Use import type for verbatimModuleSyntax
import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// --- BUTTON ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', isLoading, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`btn btn-${variant} ${className}`}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// --- INPUT ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${className}`}>
        <label htmlFor={id} className="form-label">{label}</label>
        <input
          ref={ref}
          id={id}
          className={`form-input ${error ? 'has-error' : ''}`}
          aria-invalid={!!error}
          {...props}
        />
        {error && <span className="error-text" role="alert">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';