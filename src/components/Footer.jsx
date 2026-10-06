import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#1A3C34] text-white border-t border-teal-800/40 pt-16 pb-24 md:pb-8 mt-auto relative overflow-hidden">
      {/* Visual Accent Glows */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-teal-800/40">
          
          {/* Column 1: Branding & Philosophy */}
          <div className="space-y-5 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 overflow-hidden bg-white/10">
                <img src="/appointory-logo-mark.png" alt="Appointory Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-heading text-xl font-black tracking-tight text-white block">
                  Appointory<span className="text-[#2D9B6F]">.</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4E4DF]/40 block mt-0.5">Healthcare OS for Bharat</span>
              </div>
            </div>
            <p className="text-xs text-[#D4E4DF]/70 font-medium leading-relaxed max-w-sm">
              Care without the Waiting Room. Revolutionizing OPD clinics with live TV token displays, WhatsApp alerts, 0% GST billing, and connected diagnostic labs.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#D4E4DF]/60">
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              <span>•</span>
              <Link to="/press" className="hover:text-white transition-colors">Press</Link>
              <span>•</span>
              <Link to="/links" className="hover:text-white transition-colors">Links</Link>
            </div>
          </div>

          {/* Column 2: Platform Features */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-[#2D9B6F] tracking-widest">
              Core Features
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#D4E4DF]/80">
              <li>
                <Link to="/features/queue-management" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> OPD Queue Management
                </Link>
              </li>
              <li>
                <Link to="/features/token-display-tv" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> Waiting Room TV Display
                </Link>
              </li>
              <li>
                <Link to="/features/gst-billing" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> 0% GST Billing (SAC 999312)
                </Link>
              </li>
              <li>
                <Link to="/features/lab-network" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> Diagnostic Lab Handshake
                </Link>
              </li>
              <li>
                <Link to="/features/digital-prescription" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> Digital Rx Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions & Portals */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-[#2D9B6F] tracking-widest">
              Solutions & Pricing
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#D4E4DF]/80">
              <li>
                <Link to="/for/clinics" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> For Polyclinics
                </Link>
              </li>
              <li>
                <Link to="/for/doctors" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> For Independent Doctors
                </Link>
              </li>
              <li>
                <Link to="/for/labs" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> For Pathology Labs
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/compare/appointory-vs-practo" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> Appointory vs Practo
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#2D9B6F]">•</span> Clinical Insights & Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Major Indian Cities */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-[#2D9B6F] tracking-widest">
              Cities in India
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs font-medium text-[#D4E4DF]/80">
              <Link to="/clinic-software/ahmedabad" className="hover:text-white transition-colors">Ahmedabad</Link>
              <Link to="/clinic-software/surat" className="hover:text-white transition-colors">Surat</Link>
              <Link to="/clinic-software/vadodara" className="hover:text-white transition-colors">Vadodara</Link>
              <Link to="/clinic-software/rajkot" className="hover:text-white transition-colors">Rajkot</Link>
              <Link to="/clinic-software/mumbai" className="hover:text-white transition-colors">Mumbai</Link>
              <Link to="/clinic-software/delhi" className="hover:text-white transition-colors">Delhi NCR</Link>
              <Link to="/clinic-software/bengaluru" className="hover:text-white transition-colors">Bengaluru</Link>
              <Link to="/clinic-software/pune" className="hover:text-white transition-colors">Pune</Link>
            </div>
          </div>

          {/* Column 5: Trust & Live Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-[#2D9B6F] tracking-widest">
              DPDP Compliance
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2.5 bg-teal-950/40 rounded-xl border border-teal-800/30">
                <ShieldCheck size={18} className="text-[#2D9B6F] shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase text-white tracking-wider">DPDP Act 2023</p>
                  <p className="text-[10px] font-bold text-[#D4E4DF]/60">AES-256 Vault</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 bg-teal-950/40 rounded-xl border border-teal-800/30">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#2D9B6F]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Cloud Engine</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">99.9% Up</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Metadata Section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#D4E4DF]/80">
              © 2026 Appointory. All rights reserved.
            </p>
            <p className="text-xs font-medium text-[#D4E4DF]/70 flex items-center gap-1">
              Operated by <span className="text-[#2D9B6F] font-bold">The Intelliverse</span> • Digital Health Intermediary
            </p>
          </div>

          {/* Legal Links */}
          <nav aria-label="Legal and Policy Links" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-[#D4E4DF]/90">
            <Link to="/privacy" className="hover:text-white transition-colors underline-offset-4 hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors underline-offset-4 hover:underline">Terms of Use</Link>
            <Link to="/cookie-policy" className="hover:text-white transition-colors underline-offset-4 hover:underline">Cookie Policy</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors underline-offset-4 hover:underline">Refund Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors underline-offset-4 hover:underline">Support & Grievance</Link>
          </nav>
        </div>

      </div>
    </footer>
  );
};

export default Footer;