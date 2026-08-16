import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ExperienceDTO, CompanyDTO, PlatformAnalyticsDTO } from '@placeprep/shared';
import { ExperienceCard } from '../components/experiences/ExperienceCard';
import { CompanyCard } from '../components/companies/CompanyCard';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Search,
  Compass,
  Building2,
  HelpCircle,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  GraduationCap,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [recentExperiences, setRecentExperiences] = useState<ExperienceDTO[]>([]);
  const [topCompanies, setTopCompanies] = useState<CompanyDTO[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalyticsDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [expRes, compRes, anaRes]: any = await Promise.all([
          api.get('/experiences?limit=4'),
          api.get('/companies?limit=4'),
          api.get('/analytics/overview').catch(() => null),
        ]);

        if (expRes.success) setRecentExperiences(expRes.data);
        if (compRes.success) setTopCompanies(compRes.data);
        if (anaRes?.success) setAnalytics(anaRes.data);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const coreCategories = [
    { title: 'Data Structures & Algorithms', slug: 'dsa', icon: '⚡', desc: 'Binary Trees, Graphs, DP, Shortest Paths' },
    { title: 'System Design', slug: 'system-design', icon: '🏛️', desc: 'Distributed Caching, Sharding, Rate Limiting' },
    { title: 'Operating Systems & Concurrency', slug: 'os', icon: '💻', desc: 'Threads, Deadlocks, Mutex Locks, Page Faults' },
    { title: 'DBMS & SQL', slug: 'dbms', icon: '🗄️', desc: 'Indexes, ACID, B-Trees, Normalization' },
    { title: 'Computer Networks', slug: 'cn', icon: '🌐', desc: 'TCP/IP, DNS, HTTPS, WebSockets' },
    { title: 'Behavioral & HR (STAR)', slug: 'hr', icon: '🎯', desc: 'Leadership Principles, Situational Scenarios' },
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-8 text-center max-w-4xl mx-auto px-4">
        {/* Glow effect behind header */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-6 shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Verified College Placement & Interview Archive</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Master Your Campus <br />
          <span className="gradient-text">Placement Interviews</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Read real technical round breakdowns, questions asked, difficulty ratings, and salary packages shared by placed seniors from top colleges.
        </p>

        {/* Global Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/experiences?query=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl focus-within:border-indigo-500 transition-colors"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company (Google, Amazon), role (SDE-1), or topic (Graphs)..."
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none px-2"
            />
            <Button type="submit" size="md">
              Search
            </Button>
          </form>
        </div>

        {/* Quick Stat Highlights */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            <div className="glass-panel p-4 rounded-xl text-center border border-slate-800/80">
              <span className="block text-2xl md:text-3xl font-extrabold text-white font-mono">
                {analytics.totalExperiences}+
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Interview Reports</span>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center border border-slate-800/80">
              <span className="block text-2xl md:text-3xl font-extrabold text-indigo-400 font-mono">
                {analytics.totalCompanies}+
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Recruiting Companies</span>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center border border-slate-800/80">
              <span className="block text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono">
                ₹{analytics.avgCtcLpa} LPA
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Avg Off-Campus/On-Campus CTC</span>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center border border-slate-800/80">
              <span className="block text-2xl md:text-3xl font-extrabold text-purple-400 font-mono">
                {analytics.selectionRatePercent}%
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Offer Conversion Rate</span>
            </div>
          </div>
        )}
      </section>

      {/* Core Question Categories Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Topic-Wise Question Bank
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse actual questions asked during technical and managerial rounds
            </p>
          </div>
          <Link
            to="/questions"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            All Questions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/questions?category=${cat.slug}`}
              className="glass-panel glass-panel-hover p-5 rounded-xl block border border-slate-800 transition-all group"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Interview Experiences */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recent Placement Experiences
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verified reports with round-by-round breakdown and difficulty scores
            </p>
          </div>
          <Link
            to="/experiences"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 bg-slate-900/60 rounded-xl border border-slate-800" />
            ))}
          </div>
        ) : recentExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-xl border border-slate-800">
            <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No experiences submitted yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Be the first to share your campus placement interview journey!
            </p>
            <Link to="/submit" className="mt-4 inline-block">
              <Button size="sm">Share Experience</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Top Recruiting Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Top Recruiting Companies
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore hiring bars, average CTC, and interview archives by company
            </p>
          </div>
          <Link
            to="/companies"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            All Companies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {topCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </section>
    </div>
  );
};
