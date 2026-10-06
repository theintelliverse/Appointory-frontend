import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs Component
 * Displays semantic breadcrumb navigation for user and search engines
 */
export default function Breadcrumbs({ items = [] }) {
    // items: [{ name: 'Features', url: '/features' }, { name: 'OPD Queue Management' }]
    const allItems = [{ name: 'Home', url: '/' }, ...items];

    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-slate-500">
                {allItems.map((item, idx) => {
                    const isLast = idx === allItems.length - 1;
                    return (
                        <li key={idx} className="flex items-center gap-1.5">
                            {idx === 0 && <Home className="w-3.5 h-3.5 text-slate-400" />}
                            {isLast || !item.url ? (
                                <span className="font-semibold text-teal-800" aria-current="page">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    to={item.url}
                                    className="hover:text-teal-700 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            )}
                            {!isLast && (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
