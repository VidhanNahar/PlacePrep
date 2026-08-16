import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { QuestionDTO, DifficultyLevel } from '@placeprep/shared';
import { DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { HelpCircle, Search, Filter, RefreshCw, ChevronDown, ChevronUp, Building2, Layers } from 'lucide-react';

export const QuestionsHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Accordion open states
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get('/questions/categories').then((res: any) => {
      if (res.success) setCategories(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (selectedCategory) params.set('categoryId', selectedCategory);
        if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
        params.set('page', String(page));
        params.set('limit', '25');

        setSearchParams(params);

        const res: any = await api.get(`/questions?${params.toString()}`);
        if (res.success) {
          setQuestions(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [query, selectedCategory, selectedDifficulty, page]);

  const toggleAccordion = (id: string) => {
    setOpenQuestionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Placement Interview Question Bank
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore real questions asked across DSA, OOP, DBMS, OS, Computer Networks, and System Design.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search questions by topic tag or problem text..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Topics / Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.totalQuestions})
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
          <option value="VERY_HARD">Very Hard</option>
        </select>
      </div>

      {/* Question Accordion List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-24 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q) => {
            const isOpen = !!openQuestionIds[q.id];
            return (
              <div
                key={q.id}
                className="glass-panel rounded-xl border border-slate-800 overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleAccordion(q.id)}
                  className="p-4 md:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-900/60 select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-indigo-300 font-mono text-xs">
                        {q.topicTag}
                      </span>
                      {q.categoryName && (
                        <span className="text-xs text-slate-400 font-medium">
                          • {q.categoryName}
                        </span>
                      )}
                      {q.companyName && (
                        <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                          • <Building2 className="w-3 h-3 text-indigo-400" /> {q.companyName}
                        </span>
                      )}
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                      {q.questionText}
                    </h3>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 bg-slate-950/40 text-xs sm:text-sm text-slate-300 space-y-3">
                    {q.answerApproach ? (
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-semibold text-emerald-400 block mb-1 text-xs uppercase tracking-wider">
                          Candidate Solution Approach:
                        </span>
                        <p className="leading-relaxed whitespace-pre-line text-slate-200">
                          {q.answerApproach}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No detailed approach noted for this question.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-xl border border-slate-800">
          <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No questions found</h3>
          <p className="text-xs text-slate-400 mt-1">Try expanding your search or selecting a different category.</p>
        </div>
      )}
    </div>
  );
};
