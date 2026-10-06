import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * DirectAnswer Component for AEO (Answer Engine Optimization)
 * Renders a crisp 40-60 word direct answer to the page's primary query
 * optimized for Google AI Overviews, Perplexity, ChatGPT, and Featured Snippets.
 */
export default function DirectAnswer({ query, answer, source = 'Appointory Clinical Knowledge Base' }) {
    return (
        <aside 
            aria-label="Direct Summary" 
            className="my-6 p-5 sm:p-6 bg-teal-50/70 border border-teal-200/80 rounded-2xl shadow-xs text-slate-800"
        >
            <div className="flex items-center gap-2 text-teal-800 font-semibold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                <span>Quick Answer &bull; {source}</span>
            </div>
            {query && (
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {query}
                </h3>
            )}
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
                {answer}
            </p>
        </aside>
    );
}
