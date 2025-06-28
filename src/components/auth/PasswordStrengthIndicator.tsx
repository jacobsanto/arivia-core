
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    
    // Length check
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 10;
    
    // Character variety checks
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 20;
    
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 30) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 90) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 70) return 'bg-yellow-500';
    if (strength < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-xs">
        <span>Password Strength</span>
        <span className={`font-medium ${strength >= 70 ? 'text-green-600' : strength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
          {getStrengthLabel(strength)}
        </span>
      </div>
      <Progress value={strength} className="h-2" />
    </div>
  );
};
