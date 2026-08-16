import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CompanyDTO, ExperienceDTO } from '@placeprep/shared';
import { ExperienceCard } from '../components/experiences/ExperienceCard';
import { Button } from '../components/ui/Button';
import { Building2, Globe, ArrowLeft, PenSquare, Layers } from 'lucide-react';

export const CompanyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [experiences, setExperiences] = useState<ExperienceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyAndExperiences = async () => {
      setIsLoading(true);
      try {
        const compRes: any = await api.get(`/companies/${slug}`);
        if (compRes.success && compRes.data) {
          setCompany(compRes.data);
          const expRes: any = await api.get(`/experiences?companyId=${compRes.data.id}&limit=20`);
          if (expRes.success) {
            setExperiences(expRes.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchCompanyAndExperiences();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-32 bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-900 rounded-xl" />
          <div className="h-48 bg-slate-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Company not found</h2>
        <Link to="/companies" className="mt-4 inline-block">
          <Button size="sm">Back to Companies</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/companies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400"
      >
        <ArrowLeft className="w-4 h-4" /> All Companies
      </Link>

      {/* Company Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2.5 flex-shrink-0">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{company.name}</h1>
            {company.industry && (
              <p className="text-sm text-indigo-400 font-medium mt-0.5">{company.industry}</p>
            )}
            {company.description && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                {company.description}
              </p>
            )}
            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mt-3 underline"
              >
                <Globe className="w-3.5 h-3.5" /> Visit Careers Website
              </a>
            )}
          </div>
        </div>

        <Link to="/submit">
          <Button size="sm" leftIcon={<PenSquare className="w-4 h-4" />}>
            Share Experience
          </Button>
        </Link>
      </div>

      {/* Experiences section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Interview Experiences for {company.name} ({experiences.length})
          </h2>
        </div>

        {experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-xl border border-slate-800">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">
              No interview experiences yet for {company.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Did you recently interview at {company.name}? Share your questions with your peers!
            </p>
            <Link to="/submit" className="mt-4 inline-block">
              <Button size="sm">Share Experience</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
