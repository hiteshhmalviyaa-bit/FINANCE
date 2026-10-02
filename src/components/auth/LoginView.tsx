import React, { useState } from 'react';
import { Lock, Mail, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { UserRole } from '../../types/finance';
import { Modal } from '../common/Modal';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { users, setCurrentUser, company } = useFinance();

  const [email, setEmail] = useState('aditi.admin@acmedigital.internal');
  const [password, setPassword] = useState('••••••••');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      onLoginSuccess();
    } else {
      // Default to first user if typed something else
      if (users.length > 0) {
        setCurrentUser(users[0]);
        onLoginSuccess();
      }
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      onLoginSuccess();
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setIsForgotOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
            {company.name.charAt(0)}
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            {company.name}
          </span>
        </div>
        <h2 className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Internal Accounting & Finance Portal
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-200 text-xs">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-indigo-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              Sign In to Finance Portal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins for Easy MVP Review */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick 1-Click Role Login (MVP Testing)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('admin')}
                className="p-2 border border-purple-200 bg-purple-50/70 hover:bg-purple-100 rounded-lg text-center cursor-pointer transition-colors"
              >
                <span className="block font-bold text-purple-900 text-xs">Admin</span>
                <span className="text-[10px] text-purple-600">Full Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('finance')}
                className="p-2 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 rounded-lg text-center cursor-pointer transition-colors"
              >
                <span className="block font-bold text-blue-900 text-xs">Finance</span>
                <span className="text-[10px] text-blue-600">Bookkeeping</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('viewer')}
                className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-center cursor-pointer transition-colors"
              >
                <span className="block font-bold text-slate-800 text-xs">Viewer</span>
                <span className="text-[10px] text-slate-500">Read-Only</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <Modal
          isOpen={isForgotOpen}
          onClose={() => setIsForgotOpen(false)}
          title="Reset Account Password"
          subtitle="Enter your verified corporate email to receive a password reset link"
          maxWidth="sm"
        >
          {forgotSent ? (
            <div className="text-center py-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900">Reset Link Sent</h4>
              <p className="text-xs text-slate-500">
                Instructions have been dispatched to your corporate inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.internal"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
