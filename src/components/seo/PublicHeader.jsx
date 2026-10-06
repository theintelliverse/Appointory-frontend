import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function PublicHeader() {
    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img 
                        src="/appointory-logo-mark.png" 
                        alt="Appointory Logo" 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl"
                    />
                    <div>
                        <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 block leading-tight">
                            Appointory<span className="text-teal-600">.</span>
                        </span>
                        <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-widest block">
                            Care without the Waiting Room
                        </span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link to="/features/queue-management" className="hover:text-teal-700 transition-colors">Queue System</Link>
                    <Link to="/features/gst-billing" className="hover:text-teal-700 transition-colors">0% GST Billing</Link>
                    <Link to="/features/lab-network" className="hover:text-teal-700 transition-colors">Lab Network</Link>
                    <Link to="/pricing" className="hover:text-teal-700 transition-colors">Pricing</Link>
                    <Link to="/blog" className="hover:text-teal-700 transition-colors">Insights</Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link 
                        to="/login"
                        className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-teal-700 px-3 py-2 transition-colors"
                    >
                        Provider Sign In
                    </Link>
                    <Link
                        to="/register-clinic"
                        className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all"
                    >
                        <span>Start Free</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
