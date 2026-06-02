import { forwardRef } from 'react';
import { Phone } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Applies (XX) XXXXX-XXXX mask.
 * No country code prefix — user types DDD + number only.
 * Max 11 local digits.
 */
export function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Returns only digits — the value the API expects. */
export function cleanPhone(masked: string): string {
  return masked.replace(/\D/g, '');
}

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: string;
  onChange: (masked: string) => void;
  error?: boolean;
  className?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, error, className, ...rest }, ref) => {
    return (
      <div className="relative">
        <Phone
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
        />
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(maskPhone(e.target.value))}
          placeholder="(11) 99999-9999"
          maxLength={15}
          className={cn('input pl-10', error && 'border-red-400 focus:border-red-500', className)}
          {...rest}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
