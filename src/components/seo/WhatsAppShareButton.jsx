import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * WhatsAppShareButton Component
 * Generates official WhatsApp share links with UTM tracking parameters:
 * utm_source=whatsapp&utm_medium=social_share&utm_campaign=viral_preview
 */
export default function WhatsAppShareButton({
    text = 'Check out Appointory – Care without the Waiting Room',
    path = '',
    className = ''
}) {
    const siteUrl = 'https://appointory.in';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const shareUrl = `${siteUrl}${cleanPath === '/' ? '' : cleanPath}?utm_source=whatsapp&utm_medium=social_share&utm_campaign=viral_preview`;
    
    const message = `${text}\n👉 ${shareUrl}`;
    const waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share this on WhatsApp"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer ${className}`}
        >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Share on WhatsApp</span>
        </a>
    );
}
