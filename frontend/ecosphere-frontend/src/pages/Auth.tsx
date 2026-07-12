import React, { useState } from 'react';
import { Leaf, Mail, Lock, Eye, EyeOff, User, Building, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Auth = ({ onLogin, onBack }: { onLogin: () => void, onBack?: () => void }) => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    role: 'Employee'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          orgName: formData.companyName,
        });
      }
      onLogin();
    } catch (err: unknown) {
      const e = err as { message?: string; body?: { error?: string } };
      setError(e?.body?.error || e?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12">
        
        {/* Brand & Back */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">EcoSphere</span>
          </div>
          {onBack && (
            <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to site
            </button>
          )}
        </div>

        <div className="w-full max-w-md mx-auto sm:mx-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-500 mb-8">
            {isLogin 
              ? 'Enter your details to access your ESG dashboard.' 
              : 'Join EcoSphere and start tracking your sustainability impact.'}
          </p>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 21 21">
                <path fill="#f35325" d="M1 1h9v9H1z"/>
                <path fill="#81bc06" d="M11 1h9v9h-9z"/>
                <path fill="#05a6f0" d="M1 11h9v9H1z"/>
                <path fill="#ffba08" d="M11 11h9v9h-9z"/>
              </svg>
              Microsoft
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative bg-slate-50 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Or continue with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Jane Doe" 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Acme Corp" 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select 
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@company.com" 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center pt-2">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start pt-2">
                <input 
                  id="terms" 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                />
                <label htmlFor="terms" className="ml-2 block text-xs text-slate-500 cursor-pointer">
                  I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
                </label>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({ email: '', password: '', confirmPassword: '', fullName: '', companyName: '', role: 'Employee' });
              }}
              className="ml-1.5 font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>

        </div>
      </div>

      {/* Right Column: Illustration */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden p-12">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 max-w-lg">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold">Enterprise-Grade ESG</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              "EcoSphere transformed how we track and report our sustainability metrics. It's not just a dashboard; it's the operating system for our environmental initiatives."
            </p>
            
            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-indigo-500 flex items-center justify-center font-bold text-lg">
                MC
              </div>
              <div>
                <p className="font-semibold text-white">Michael Chen</p>
                <p className="text-sm text-slate-400">Chief Sustainability Officer, TechFlow</p>
              </div>
            </div>
          </div>

          {/* Floating UI Elements for visual interest */}
          <div className="absolute -right-12 -bottom-12 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Q3 Report Generated</p>
              <p className="text-slate-400 text-xs">Just now</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Auth;
