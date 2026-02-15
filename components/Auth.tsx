
import React, { useState } from 'react';
import { TrendingUp, Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { AuthService } from '../services/authService.ts';
import { User as UserType } from '../types.ts';

interface AuthProps {
  onAuthenticated: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const user = await AuthService.login(formData.email, formData.password);
        onAuthenticated(user);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await AuthService.signup(formData.email, formData.name, formData.password);
        setSuccess("Account created successfully! You can now log in.");
        setIsLogin(true);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const useDemoCredentials = () => {
    setFormData({
        ...formData,
        email: 'test@example.com',
        password: 'password123'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Visual/Marketing Side */}
        <div className="hidden lg:flex flex-col justify-between bg-brand-primary p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/20 rounded-full -ml-32 -mb-32 blur-3xl border border-white/10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-10">
              <div className="bg-white p-2 rounded-xl shadow-lg">
                <TrendingUp className="text-brand-primary" size={24} />
              </div>
              <span className="font-black text-2xl tracking-tight">Extraque</span>
            </div>
            
            <h1 className="text-5xl font-black leading-tight mb-6">
              Smart Wealth <br /> 
              <span className="text-teal-300">Simplified.</span>
            </h1>
            <p className="text-teal-50/80 text-lg font-medium max-w-md">
              The professional-grade companion for tracking every transaction, paying bills on time, and smashing your savings goals.
            </p>
          </div>

        </div>

        {/* Auth Form Side */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative">
          <div className="lg:hidden flex items-center space-x-2 mb-10">
            <div className="bg-brand-primary p-1.5 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Extra<span className="text-brand-primary">que</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              {isLogin 
                ? 'Enter your credentials to access your vault.' 
                : 'Create an account to start your financial journey.'}
            </p>
          </div>

          {isLogin && (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3 group cursor-pointer hover:border-brand-primary/30 transition-all" onClick={useDemoCredentials}>
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
                    <Info size={18} />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Demo Credentials</p>
                    <p className="text-[11px] text-slate-500 font-medium">Email: <span className="font-bold text-slate-700">test@example.com</span></p>
                    <p className="text-[11px] text-slate-500 font-medium">Password: <span className="font-bold text-slate-700">password123</span></p>
                    <p className="text-[10px] text-brand-primary font-black uppercase mt-2 group-hover:underline">Click to Auto-fill</p>
                </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-in">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-bold animate-in flex items-center space-x-2">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  required 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs font-black text-brand-primary uppercase tracking-widest hover:underline">Forgot Password?</button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-brand-primary text-white font-black rounded-2xl hover:brightness-110 shadow-xl shadow-brand-primary/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Create Your Account'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium text-sm">
              {isLogin ? "Don't have an account yet?" : "Already a member?"} 
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
                className="ml-2 font-black text-brand-primary uppercase tracking-widest hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center mb-6">Or continue with</p>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                <span className="text-xs font-bold text-slate-700">Google</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475633/apple-color.svg" className="w-5 h-5" alt="apple" />
                <span className="text-xs font-bold text-slate-700">Apple</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
