import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { PlatformAnalyticsDTO } from '@placeprep/shared';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, IndianRupee, HelpCircle, Building2, Layers } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<PlatformAnalyticsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then((res: any) => {
        if (res.success) setAnalytics(res.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-28 bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-900 rounded-2xl" />
          <div className="h-72 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Analytics currently unavailable</h2>
      </div>
    );
  }

  const difficultyData = [
    { name: 'Easy', count: analytics.difficultyDistribution.EASY || 0, color: '#10b981' },
    { name: 'Medium', count: analytics.difficultyDistribution.MEDIUM || 0, color: '#f59e0b' },
    { name: 'Hard', count: analytics.difficultyDistribution.HARD || 0, color: '#f43f5e' },
    { name: 'Very Hard', count: analytics.difficultyDistribution.VERY_HARD || 0, color: '#e11d48' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          Campus Placement Intelligence & Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          High-level aggregate statistics across all verified placement interview submissions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Experiences
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{analytics.totalExperiences}</span>
            <span className="text-xs text-indigo-400 font-medium">Reports</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Average Package (CTC)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">₹{analytics.avgCtcLpa}</span>
            <span className="text-xs text-emerald-400 font-medium">LPA</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Offer Conversion Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400 font-mono">{analytics.selectionRatePercent}%</span>
            <span className="text-xs text-purple-400 font-medium">Selected</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Verified Question Bank
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-400 font-mono">{analytics.totalQuestions}</span>
            <span className="text-xs text-sky-400 font-medium">Questions</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recruiting Companies Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Top Companies by Interview Experience Submissions
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topCompanies}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Overall Interview Difficulty Breakdown
          </h2>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Question Topics Leaderboard */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Most Frequently Tested Technical Topics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {analytics.topQuestionTopics.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-semibold text-slate-100 block">{item.topic}</span>
                <span className="text-xs text-slate-400">{item.category}</span>
              </div>
              <span className="px-2 py-1 rounded bg-indigo-950/80 text-indigo-300 font-mono text-xs font-bold border border-indigo-800/40">
                {item.count} questions
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
