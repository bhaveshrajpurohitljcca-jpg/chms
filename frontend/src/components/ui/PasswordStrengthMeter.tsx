import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'Special character (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.valid).length;

  const getStrengthConfig = () => {
    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-400' };
      case 2:
        return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/4', textColor: 'text-orange-400' };
      case 3:
        return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/4', textColor: 'text-yellow-400' };
      case 4:
        return { label: 'Strong', color: 'bg-green-500', width: 'w-full', textColor: 'text-green-400' };
      default:
        return { label: 'Too Weak', color: 'bg-red-700', width: 'w-1/12', textColor: 'text-red-500' };
    }
  };

  const config = getStrengthConfig();

  return (
    <div className="mt-3 space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-white/50">Password Strength:</span>
        <span className={`font-bold ${config.textColor}`}>{config.label}</span>
      </div>

      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${config.color} ${config.width} transition-all duration-300 rounded-full`} />
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {checks.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
            {item.valid ? (
              <Check size={12} className="text-green-400 shrink-0" />
            ) : (
              <X size={12} className="text-white/30 shrink-0" />
            )}
            <span className={item.valid ? 'text-white/80 font-medium' : 'text-white/40'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
