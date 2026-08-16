import React from 'react';
import { Link } from 'react-router-dom';
import { CompanyDTO } from '@placeprep/shared';
import { Building2, Compass, Globe, ArrowRight } from 'lucide-react';

export const CompanyCard: React.FC<{ company: CompanyDTO }> = ({ company }) => {
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="glass-panel glass-panel-hover rounded-xl p-5 block transition-all group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 overflow-hidden flex-shrink-0 group-hover:border-indigo-500/50 transition-colors">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Building2 className="w-6 h-6 text-indigo-400" />
            )}
          </div>

          <span className="px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/50 text-indigo-300 text-xs font-semibold">
            {company.totalExperiencesCount}{' '}
            {company.totalExperiencesCount === 1 ? 'Experience' : 'Experiences'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
          {company.name}
        </h3>

        {company.industry && (
          <p className="text-xs text-slate-400 font-medium mt-0.5 mb-2.5">
            {company.industry}
          </p>
        )}

        {company.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {company.description}
          </p>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
        <span>Browse Interview Reports</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
