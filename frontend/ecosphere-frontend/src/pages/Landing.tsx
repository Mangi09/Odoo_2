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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">EcoSphere</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onNavigateToAuth}
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onNavigateToAuth}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            EcoSphere 2.0 is now live
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Enterprise ESG Management, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-500">Simplified.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track carbon emissions, engage employees through gamification, automate compliance audits, and generate investor-ready reports in one unified platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full text-base font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-full text-base font-medium transition-colors">
              Book a Demo
            </button>
          </div>

          {/* Hero Illustration */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent z-10 bottom-0 h-32 pointer-events-none mt-auto"></div>
            <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-xl shadow-2xl p-2 relative overflow-hidden ring-1 ring-slate-900/5">
              {/* Fake Browser Window */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200/60 bg-slate-50/50 rounded-t-xl">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              </div>
              
              {/* Abstract Dashboard Content */}
              <div className="p-8 grid grid-cols-3 gap-6 bg-slate-50">
                <div className="col-span-2 space-y-6">
                  <div className="h-48 rounded-xl bg-white border border-slate-200 flex items-end justify-between p-6 gap-2">
                    {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                      <div key={i} className="w-full bg-indigo-500 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-32 rounded-xl bg-white border border-slate-200 p-6 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><Leaf className="w-4 h-4 text-green-600"/></div>
                      <div className="w-24 h-4 bg-slate-100 rounded"></div>
                    </div>
                    <div className="h-32 rounded-xl bg-white border border-slate-200 p-6 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><Trophy className="w-4 h-4 text-orange-600"/></div>
                      <div className="w-32 h-4 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 space-y-6">
                  <div className="h-32 rounded-xl bg-slate-900 p-6 flex flex-col justify-between">
                     <div className="w-20 h-4 bg-slate-700 rounded"></div>
                     <div className="w-full h-8 bg-slate-800 rounded mt-auto"></div>
                  </div>
                  <div className="h-48 rounded-xl bg-white border border-slate-200 p-6 space-y-4">
                     <div className="w-full h-10 bg-slate-50 rounded flex items-center px-4 gap-3"><div className="w-6 h-6 rounded-full bg-slate-200"></div><div className="w-20 h-3 bg-slate-200 rounded"></div></div>
                     <div className="w-full h-10 bg-slate-50 rounded flex items-center px-4 gap-3"><div className="w-6 h-6 rounded-full bg-slate-200"></div><div className="w-24 h-3 bg-slate-200 rounded"></div></div>
                     <div className="w-full h-10 bg-slate-50 rounded flex items-center px-4 gap-3"><div className="w-6 h-6 rounded-full bg-slate-200"></div><div className="w-16 h-3 bg-slate-200 rounded"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-10 border-y border-slate-200 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Acme Corp', 'GlobalTech', 'Nexus Industries', 'GreenFuture', 'AeroDynamics'].map((logo, i) => (
              <span key={i} className="text-xl font-bold font-serif text-slate-800">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">Everything you need to reach Net Zero</h2>
            <p className="text-lg text-slate-600">A complete operating system for your sustainability initiatives, perfectly integrated.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {/* Feature 1 */}
            <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200 p-8 flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/10 transition-all overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Environmental Tracking</h3>
                <p className="text-slate-600 max-w-md">Automate carbon footprint calculations across Scope 1, 2, and 3 emissions. Set reduction goals and monitor real-time progress.</p>
              </div>
              {/* Abstract decorative element */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-br from-green-50 to-green-100/50 rounded-tl-full translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>
            </div>

            {/* Feature 2 */}
            <div className="md:col-span-1 rounded-3xl bg-slate-900 text-white border border-slate-800 p-8 flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
               <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-6">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Gamification</h3>
                <p className="text-slate-400">Engage employees with ESG challenges, XP, leaderboards, and real-world rewards.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-1 rounded-3xl bg-white border border-slate-200 p-8 flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Social Impact</h3>
                <p className="text-slate-600">Manage CSR activities, track employee volunteer hours, and foster community engagement.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 rounded-3xl bg-indigo-50 border border-indigo-100 p-8 flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden">
               <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Automated Reporting</h3>
                <p className="text-slate-600 max-w-md">Generate investor-ready ESG reports in one click. Export to PDF, CSV, or Excel with full compliance mapping.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">500+</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Organizations</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-indigo-600 mb-2">2.4M</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tons CO₂e Tracked</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-green-500 mb-2">150k</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Employees Engaged</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">12k+</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Reports Generated</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to transform your ESG strategy?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of forward-thinking companies already using EcoSphere to build a more sustainable future.
          </p>
          <button 
            onClick={onNavigateToAuth}
            className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors"
          >
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-6 text-sm text-slate-400">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">EcoSphere</span>
          </div>
          
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact Support</a>
          </div>
          
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} EcoSphere Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
