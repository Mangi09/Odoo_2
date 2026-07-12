import { useEffect, useState } from 'react';
import {
  Leaf, ArrowRight, Users, Trophy, FileText
} from 'lucide-react';

export const Landing = ({ onNavigateToAuth }: { onNavigateToAuth: () => void }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans selection:bg-green-500/30">

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-md shadow-green-600/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EcoSphere</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-green-400 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToAuth}
              className="hidden sm:block text-sm font-medium text-slate-300 hover:text-green-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateToAuth}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-green-600/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">

            <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
              Ready to transform your ESG strategy?
            </h1>

            <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of forward-thinking companies already using EcoSphere to build a more sustainable future.
            </p>

            <button
              onClick={onNavigateToAuth}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full text-lg font-medium transition-all shadow-xl shadow-green-600/30 mx-auto"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-6 text-sm text-slate-500">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-60 hover:opacity-100 transition-all duration-500">
            {['Acme Corp', 'GlobalTech', 'Nexus Industries', 'GreenFuture', 'AeroDynamics'].map((logo, i) => (
              <span key={i} className="text-lg font-bold font-serif text-slate-300">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">Everything you need to reach Net Zero</h2>
            <p className="text-lg text-slate-400">A complete operating system for your sustainability initiatives, perfectly integrated.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[320px]">
            {/* Feature 1 */}
            <div className="md:col-span-2 rounded-3xl bg-slate-800 border border-slate-700 p-8 flex flex-col justify-between group hover:shadow-xl transition-all overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-green-600/20 text-green-400 flex items-center justify-center mb-6">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Environmental Tracking</h3>
                <p className="text-slate-400 max-w-md">Automate carbon footprint calculations across Scope 1, 2, and 3 emissions. Set reduction goals and monitor real-time progress.</p>
              </div>
              {/* Abstract decorative element */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-br from-yellow-500/10 to-green-500/10 rounded-tl-full translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* Feature 2 */}
            <div className="md:col-span-1 rounded-3xl bg-slate-800 text-white border border-slate-700 p-8 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-yellow-600/20 text-yellow-400 flex items-center justify-center mb-6">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Gamification</h3>
                <p className="text-slate-400">Engage employees with ESG challenges, XP, leaderboards, and real-world rewards.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-1 rounded-3xl bg-slate-800 border border-slate-700 p-8 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Social Impact</h3>
                <p className="text-slate-400">Manage CSR activities, track employee volunteer hours, and foster community engagement.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 rounded-3xl bg-slate-800 border border-slate-700 p-8 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-700 text-slate-300 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Automated Reporting</h3>
                <p className="text-slate-400 max-w-md">Generate investor-ready ESG reports in one click. Export to PDF, CSV, or Excel with full compliance mapping.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-24 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Organizations</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-green-400 mb-2">2.4M</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tons CO₂e Tracked</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">150k</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Employees Engaged</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">12k+</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Reports Generated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">EcoSphere</span>
          </div>

          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a>
          </div>

          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} EcoSphere Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
