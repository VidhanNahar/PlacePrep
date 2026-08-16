import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  CompanyDTO,
  DifficultyLevel,
  ExperienceType,
  SelectionStatus,
  RoundType,
  RoundInput,
  QuestionInput,
} from '@placeprep/shared';
import { Button } from '../components/ui/Button';
import {
  Plus,
  Trash2,
  HelpCircle,
  Layers,
  Sparkles,
  Building2,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  EyeOff,
} from 'lucide-react';

export const SubmitExperience: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [companyId, setCompanyId] = useState('');
  const [roleTitle, setRoleTitle] = useState('Software Development Engineer - 1');
  const [expType, setExpType] = useState<ExperienceType>('ON_CAMPUS');
  const [batchYear, setBatchYear] = useState(2025);
  const [placementCycleYear, setPlacementCycleYear] = useState(2024);
  const [outcome, setOutcome] = useState<SelectionStatus>('SELECTED');
  const [overallDifficulty, setOverallDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [compensationCtc, setCompensationCtc] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('Bangalore / Hybrid');
  const [overview, setOverview] = useState('');
  const [preparationTips, setPreparationTips] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Dynamic Rounds State
  const [rounds, setRounds] = useState<RoundInput[]>([
    {
      roundNumber: 1,
      roundName: 'Online Coding Assessment',
      roundType: 'ONLINE_ASSESSMENT',
      difficulty: 'MEDIUM',
      durationMinutes: 90,
      description: 'HackerRank test containing 2 coding questions and behavioral assessment.',
      questions: [],
    },
  ]);

  useEffect(() => {
    // Fetch companies and categories for form dropdowns
    api.get('/companies?limit=100').then((res: any) => {
      if (res.success) setCompanies(res.data);
    }).catch(console.error);

    api.get('/questions/categories').then((res: any) => {
      if (res.success) setCategories(res.data);
    }).catch(console.error);
  }, []);

  const addRound = () => {
    const nextRoundNum = rounds.length + 1;
    setRounds([
      ...rounds,
      {
        roundNumber: nextRoundNum,
        roundName: `Technical Interview ${nextRoundNum - 1}`,
        roundType: 'TECHNICAL',
        difficulty: 'MEDIUM',
        durationMinutes: 60,
        description: '',
        questions: [],
      },
    ]);
  };

  const removeRound = (index: number) => {
    if (rounds.length === 1) return;
    const updated = rounds.filter((_, idx) => idx !== index).map((r, idx) => ({
      ...r,
      roundNumber: idx + 1,
    }));
    setRounds(updated);
  };

  const updateRound = (index: number, field: keyof RoundInput, value: any) => {
    const updated = [...rounds];
    updated[index] = { ...updated[index], [field]: value };
    setRounds(updated);
  };

  const addQuestionToRound = (roundIndex: number) => {
    const defaultCatId = categories.length > 0 ? categories[0].id : '';
    const updated = [...rounds];
    const newQuestion: QuestionInput = {
      categoryId: defaultCatId,
      questionText: '',
      answerApproach: '',
      difficulty: 'MEDIUM',
      topicTag: 'Data Structures',
    };
    updated[roundIndex].questions = [...updated[roundIndex].questions, newQuestion];
    setRounds(updated);
  };

  const updateQuestionInRound = (
    roundIndex: number,
    questionIndex: number,
    field: keyof QuestionInput,
    value: any
  ) => {
    const updated = [...rounds];
    const qList = [...updated[roundIndex].questions];
    qList[questionIndex] = { ...qList[questionIndex], [field]: value };
    updated[roundIndex].questions = qList;
    setRounds(updated);
  };

  const removeQuestionFromRound = (roundIndex: number, questionIndex: number) => {
    const updated = [...rounds];
    updated[roundIndex].questions = updated[roundIndex].questions.filter(
      (_, idx) => idx !== questionIndex
    );
    setRounds(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to submit your interview experience.');
      return;
    }

    if (!companyId) {
      setError('Please select a company.');
      return;
    }

    if (overview.length < 30) {
      setError('Please provide a more descriptive hiring overview (at least 30 characters).');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        companyId,
        roleTitle,
        expType,
        batchYear: Number(batchYear),
        placementCycleYear: Number(placementCycleYear),
        outcome,
        overallDifficulty,
        totalRounds: rounds.length,
        compensationCtc: compensationCtc ? Number(compensationCtc) : undefined,
        location,
        overview,
        preparationTips,
        isAnonymous,
        rounds,
      };

      const res: any = await api.post('/experiences', payload);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/experiences');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit experience. Please verify form values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Experience Submitted!</h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Thank you for helping your junior peers! Your interview experience has been sent to our placement moderation team for quick review.
        </p>
        <p className="text-xs text-indigo-400">Redirecting to experiences hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pay it Forward to Your Campus Juniors</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Share Your Placement Experience
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Document the hiring process, interview questions asked, difficulty ratings, and preparation advice.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: General Company & Role Overview */}
        <section className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            1. Placement & Role Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Name *
              </label>
              <select
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Role / Designation *
              </label>
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. SDE-1, Software Engineer, Analyst"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Experience Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Placement Type *
              </label>
              <select
                value={expType}
                onChange={(e) => setExpType(e.target.value as ExperienceType)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ON_CAMPUS">On-Campus Placement</option>
                <option value="OFF_CAMPUS">Off-Campus Hiring</option>
                <option value="INTERNSHIP">Summer Internship</option>
                <option value="PPO">Pre-Placement Offer (PPO)</option>
              </select>
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Final Result / Outcome *
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as SelectionStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="SELECTED">Selected (Received Offer)</option>
                <option value="REJECTED">Rejected</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="OPTED_OUT">Opted Out</option>
              </select>
            </div>

            {/* Overall Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Overall Interview Difficulty *
              </label>
              <select
                value={overallDifficulty}
                onChange={(e) => setOverallDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="VERY_HARD">Very Hard</option>
              </select>
            </div>

            {/* CTC Compensation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                CTC / Package in LPA (Optional)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.5"
                  value={compensationCtc || ''}
                  onChange={(e) =>
                    setCompensationCtc(e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="e.g. 24.5"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Batch Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Graduation Batch Year
              </label>
              <input
                type="number"
                value={batchYear}
                onChange={(e) => setBatchYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangalore, Hyderabad, Remote"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Hiring Overview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hiring Process Summary & Overview * (Min 30 characters)
            </label>
            <textarea
              rows={4}
              required
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Describe the recruitment drive: shortlisting criteria, number of candidates who appeared, format of rounds, and general atmosphere..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Preparation Tips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preparation Tips & Advice for Juniors
            </label>
            <textarea
              rows={3}
              value={preparationTips}
              onChange={(e) => setPreparationTips(e.target.value)}
              placeholder="Which topics to practice most? Resources used? Advice on answering behavioral / HR questions..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
            />
            <label htmlFor="anonymous" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
              Publish anonymously (your name will be hidden from students, visible only to verified moderators)
            </label>
          </div>
        </section>

        {/* Step 2: Dynamic Interview Rounds & Questions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                2. Interview Rounds & Questions ({rounds.length})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Add each round in sequential order with the specific questions you were asked.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addRound}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Round
            </Button>
          </div>

          {rounds.map((round, rIdx) => (
            <div
              key={rIdx}
              className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-indigo-300 font-mono">
                  Round {round.roundNumber}
                </span>
                {rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRound(rIdx)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Round
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs text-slate-400 mb-1">Round Name *</label>
                  <input
                    type="text"
                    required
                    value={round.roundName}
                    onChange={(e) => updateRound(rIdx, 'roundName', e.target.value)}
                    placeholder="e.g. OA, Technical Round 1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Round Type *</label>
                  <select
                    value={round.roundType}
                    onChange={(e) => updateRound(rIdx, 'roundType', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ONLINE_ASSESSMENT">Online Assessment (OA)</option>
                    <option value="TECHNICAL">Technical Coding / DSA</option>
                    <option value="SYSTEM_DESIGN">System Design (LLD / HLD)</option>
                    <option value="MANAGERIAL">Managerial</option>
                    <option value="HR">HR & Behavioral</option>
                    <option value="GROUP_DISCUSSION">Group Discussion</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Round Difficulty</label>
                  <select
                    value={round.difficulty}
                    onChange={(e) => updateRound(rIdx, 'difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="VERY_HARD">Very Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Round Experience & Flow *</label>
                <textarea
                  rows={2}
                  required
                  value={round.description}
                  onChange={(e) => updateRound(rIdx, 'description', e.target.value)}
                  placeholder="How did the round start? Was it live coding or conceptual discussion? Duration?"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Questions within this round */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    Specific Questions Asked ({round.questions?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => addQuestionToRound(rIdx)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {round.questions?.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Question #{qIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestionFromRound(rIdx, qIdx)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          value={q.questionText}
                          onChange={(e) =>
                            updateQuestionInRound(rIdx, qIdx, 'questionText', e.target.value)
                          }
                          placeholder="e.g. Design LRU Cache or Invert Binary Tree"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <select
                          value={q.categoryId}
                          onChange={(e) =>
                            updateQuestionInRound(rIdx, qIdx, 'categoryId', e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={q.topicTag}
                        onChange={(e) =>
                          updateQuestionInRound(rIdx, qIdx, 'topicTag', e.target.value)
                        }
                        placeholder="Topic Tag: e.g. Dynamic Programming, B-Trees"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      />

                      <select
                        value={q.difficulty}
                        onChange={(e) =>
                          updateQuestionInRound(rIdx, qIdx, 'difficulty', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      value={q.answerApproach || ''}
                      onChange={(e) =>
                        updateQuestionInRound(rIdx, qIdx, 'answerApproach', e.target.value)
                      }
                      placeholder="Your approach / solution steps explained in brief..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Submit CTA */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/experiences')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Submit for Review
          </Button>
        </div>
      </form>
    </div>
  );
};
