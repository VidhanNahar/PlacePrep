import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Place<span className="text-indigo-400">Prep</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Open-source campus recruitment & placement interview repository. Empowering students with real technical questions, round breakdowns, and hiring trends.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/experiences" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Recent Experiences
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Company Directory
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Topic Question Bank
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Placement Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Core Topics
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/questions?topic=dsa" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Data Structures & Algorithms
                </Link>
              </li>
              <li>
                <Link to="/questions?topic=system-design" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  System Design & Architecture
                </Link>
              </li>
              <li>
                <Link to="/questions?topic=dbms" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Database & SQL Queries
                </Link>
              </li>
              <li>
                <Link to="/questions?topic=os" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  Operating Systems & Concurrency
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} PlacePrep. Built for campus recruitment excellence.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in TypeScript & PostgreSQL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
