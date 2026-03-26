import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="text-foreground-muted block text-sm font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'border-border focus:border-primary mt-1 block w-full rounded-md border px-3 py-2 transition-colors focus:outline-none',
            className
          )}
          {...props}
        />
        <p
          className={cn(
            'text-error mt-1 text-sm transition-opacity',
            error ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          {error || '\u00A0'}
        </p>
      </div>
    );
  }
);

Input.displayName = 'Input';
