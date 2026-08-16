import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ExperienceDTO, CompanyDTO, SelectionStatus, DifficultyLevel, ExperienceType } from '@placeprep/shared';
import { ExperienceCard } from '../components/experiences/ExperienceCard';
import { Button } from '../components/ui/Button';
import { Search, Filter, RefreshCw, Layers, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const BrowseExperiences: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedCompanyId, setSelectedCompanyId] = useState(searchParams.get('companyId') || '');
  const [selectedOutcome, setSelectedOutcome] = useState(searchParams.get('outcome') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [selectedExpType, setSelectedExpType] = useState(searchParams.get('expType') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data
  const [experiences, setExperiences] = useState<ExperienceDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Companies for Filter Dropdown
  useEffect(() => {
    api.get('/companies?limit=100').then((res: any) => {
      if (res.success) setCompanies(res.data);
    }).catch(console.error);
  }, []);

  // Fetch Experiences on filter change
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (selectedCompanyId) params.set('companyId', selectedCompanyId);
        if (selectedOutcome) params.set('outcome', selectedOutcome);
        if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
        if (selectedExpType) params.set('expType', selectedExpType);
        if (sortBy) params.set('sort', sortBy);
        params.set('page', String(page));
        params.set('limit', '12');

        setSearchParams(params);

        const response: any = await api.get(`/experiences?${params.toString()}`);
        if (response.success) {
          setExperiences(response.data);
          setPagination(response.pagination);
        }
      } catch (err) {
        console.error('Error fetching experiences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, [query, selectedCompanyId, selectedOutcome, selectedDifficulty, selectedExpType, sortBy, page]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCompanyId('');
    setSelectedOutcome('');
    setSelectedDifficulty('');
    setSelectedExpType('');
    setSortBy('recent');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    query || selectedCompanyId || selectedOutcome || selectedDifficulty || selectedExpType
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Placement Interview Experiences
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse authentic campus placement experiences shared by verified college students.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-400">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="recent">Most Recent</option>
            <option value="upvotes">Most Helpful (Upvoted)</option>
            <option value="difficulty_desc">Highest Difficulty</option>
            <option value="difficulty_asc">Lowest Difficulty</option>
          </select>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search role, company, or keywords..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Company Selector */}
          <div>
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={selectedOutcome}
              onChange={(e) => {
                setSelectedOutcome(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Outcomes</option>
              <option value="SELECTED">Selected (Offer)</option>
              <option value="REJECTED">Rejected</option>
              <option value="WAITLISTED">Waitlisted</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="VERY_HARD">Very Hard</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Found <strong className="text-indigo-400 font-mono">{pagination.total}</strong> experiences matching your filters
            </span>
            <button
              onClick={clearFilters}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Experience Listing Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-52 bg-slate-900/60 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : experiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-xl border border-slate-800">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No experiences found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or clear active filters.
          </p>
          {hasActiveFilters && (
            <Button size="sm" variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            size="sm"
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage(page - 1)}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-400 font-mono px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage(page + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
