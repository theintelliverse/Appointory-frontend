import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, ExternalLink, QrCode, Info, Copy, Check, Microscope } from 'lucide-react';

const LabQR = ({ labCode, labName, labSlug, showTitle = true }) => {
  const qrRef = useRef();
  const [copied, setCopied] = useState(false);

  // The landing URL patients visit when they scan this QR
  const identifier = labSlug || labCode || '';
  const bookingUrl = `${window.location.origin}/l/${identifier}?utm_source=qr&qr=1`;

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    anchor.href = image;
    anchor.download = `Lab_QR_Gateway_${(labName || 'Diagnostic_Lab').replace(/\s+/g, '_')}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 p-6 md:p-7 rounded-3xl shadow-sm flex flex-col items-center relative overflow-hidden group">
      {/* Decorative Branding Accent */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/5 rounded-bl-[4rem] -z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full">
        {showTitle && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Microscope size={18} />
            </div>
            <h3 className="font-heading font-black text-lg text-slate-900 tracking-tight">
              Diagnostic Lab QR Gateway
            </h3>
          </div>
        )}

        <p className="text-xs text-slate-500 mb-4 text-center px-3 font-medium leading-relaxed">
          Display this QR at your sample collection counter or reception desk. Patients scan with mobile camera to view your test catalog and book direct appointments.
        </p>

        {/* QR Container with High Contrast & Error Correction */}
        <div
          ref={qrRef}
          className="p-5 bg-teal-50/40 rounded-3xl border-2 border-teal-200/70 mb-4 shadow-inner relative group/qr transition-transform hover:scale-[1.02]"
        >
          <QRCodeCanvas
            value={bookingUrl}
            size={168}
            bgColor={"#FFFFFF"}
            fgColor={"#0F766E"} // Deep Teal
            level={"H"}         // High error correction (30% recoverable)
            includeMargin={true}
          />
          {/* Scan Me Badge on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity bg-teal-900/10 backdrop-blur-[1px] rounded-[2rem]">
            <span className="bg-teal-800 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
              Scan with Phone
            </span>
          </div>
        </div>

        {/* Live Link Verification Box */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 flex items-center justify-between group/link hover:border-teal-300 transition-colors">
          <div className="overflow-hidden min-w-0 pr-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Booking Gateway URL</p>
            <p className="text-xs text-teal-800 font-bold truncate">
              {bookingUrl.replace(/^https?:\/\//, '')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy URL"
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-200/70 rounded-lg transition"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              title="Preview in new tab"
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-200/70 rounded-lg transition"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Download Button */}
        <button
          type="button"
          onClick={downloadQR}
          className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <Download size={14} /> Download PNG for Print
        </button>

        {/* Lab Code & Slug metadata */}
        <div className="mt-3.5 flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200/80 text-[11px] text-slate-600 font-semibold">
          <Info size={13} className="text-teal-600" />
          <span>
            Lab Code: <strong className="text-slate-900">{labCode}</strong>
            {labSlug && <span> · Slug: <strong className="text-slate-900">{labSlug}</strong></span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LabQR;
