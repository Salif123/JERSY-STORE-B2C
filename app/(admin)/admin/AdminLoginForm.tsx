'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { Lock, ShoppingBag } from 'lucide-react';

interface AdminLoginFormProps {
  adminPassword?: string;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  adminPassword,
}) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password.trim()) {
      toast.error('Please enter the administrator password.');
      setIsLoading(false);
      return;
    }

    // Set cookie that expires in 1 day
    document.cookie = `admin_session=${password}; path=/; max-age=86400; SameSite=Lax;`;
    
    // Refresh to update server-side auth check
    router.refresh();
    
    // Minimal delay to ensure cookie is processed
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Successfully logged into admin dashboard.');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 -z-10" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
        
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-black uppercase text-white tracking-tight">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Enter your password to manage jerseys, coupons, and orders.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Security Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full h-11 text-xs font-extrabold flex items-center justify-center gap-1.5"
            isLoading={isLoading}
          >
            Login to Dashboard
          </Button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2">
          <a
            href="/"
            className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Back to Catalog Store
          </a>
        </div>

      </div>
    </div>
  );
};
