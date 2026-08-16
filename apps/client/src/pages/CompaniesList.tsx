import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CompanyDTO } from '@placeprep/shared';
import { CompanyCard } from '../components/companies/CompanyCard';
import { Button } from '../components/ui/Button';
import { Building2, Search, Plus, X } from 'lucide-react';

export const CompaniesList: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Company Modal Form
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (industry) params.set('industry', industry);
      params.set('limit', '50');

      const res: any = await api.get(`/companies?${params.toString()}`);
      if (res.success) setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [query, industry]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    setIsCreating(true);
    try {
      const res: any = await api.post('/companies', {
        name: newCompanyName,
        industry: newCompanyIndustry,
        websiteUrl: newCompanyWebsite || undefined,
        description: newCompanyDesc || undefined,
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setNewCompanyName('');
        fetchCompanies();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create company');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Recruiting Companies Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore companies visiting campuses with historical placement interview experiences.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Suggest Company
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company by name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Industries</option>
          <option value="Big Tech / Internet">Big Tech / Internet</option>
          <option value="Software / Cloud">Software / Cloud</option>
          <option value="Quantitative Finance & Tech">Quantitative Finance & Tech</option>
          <option value="E-commerce / Cloud (AWS)">E-commerce / Retail</option>
          <option value="Mobility & Logistics">Mobility & Logistics</option>
          <option value="Enterprise Software">Enterprise Software</option>
          <option value="Networking & Cybersecurity">Networking & Cybersecurity</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-44 bg-slate-900/60 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {companies.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-xl border border-slate-800">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No companies found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your query or suggest a new company.</p>
        </div>
      )}

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Suggest a New Company</h3>

            <form onSubmit={handleCreateCompany} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Salesforce, Oracle"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Industry</label>
                <input
                  type="text"
                  value={newCompanyIndustry}
                  onChange={(e) => setNewCompanyIndustry(e.target.value)}
                  placeholder="e.g. Fintech, SaaS, Healthcare Tech"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Careers Website URL</label>
                <input
                  type="url"
                  value={newCompanyWebsite}
                  onChange={(e) => setNewCompanyWebsite(e.target.value)}
                  placeholder="https://company.com/careers"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCompanyDesc}
                  onChange={(e) => setNewCompanyDesc(e.target.value)}
                  placeholder="Brief summary of company domain and hiring focus..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isCreating}>
                  Add Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
