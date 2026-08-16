import React from 'react';
import { RoundDTO } from '@placeprep/shared';
import { DifficultyBadge, RoundTypeBadge } from '../ui/Badge';
import { Clock, HelpCircle, ChevronRight, BookOpen } from 'lucide-react';

interface RoundTimelineProps {
  rounds: RoundDTO[];
}

export const RoundTimeline: React.FC<RoundTimelineProps> = ({ rounds }) => {
  if (!rounds || rounds.length === 0) {
    return <p className="text-sm text-slate-400">No round details available.</p>;
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
      {rounds.map((round, idx) => (
        <div key={round.id || idx} className="relative flex items-start gap-4">
          {/* Timeline Node Icon */}
          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-xs text-indigo-300 flex-shrink-0 z-10 shadow-glow">
            {round.roundNumber}
          </div>

          {/* Round Content Card */}
          <div className="flex-1 glass-panel rounded-xl p-5 border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                  {round.roundName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <RoundTypeBadge type={round.roundType} />
                  <DifficultyBadge difficulty={round.difficulty} />
                  {round.durationMinutes && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {round.durationMinutes} mins
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
              {round.description}
            </p>

            {/* Questions Asked in this round */}
            {round.questions && round.questions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h5 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Questions Asked ({round.questions.length})
                </h5>

                <div className="space-y-2.5">
                  {round.questions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="text-sm font-medium text-slate-100 leading-snug">
                          {q.questionText}
                        </span>
                        <DifficultyBadge difficulty={q.difficulty} />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]">
                          {q.topicTag}
                        </span>
                        {q.categoryName && <span>• {q.categoryName}</span>}
                      </div>

                      {q.answerApproach && (
                        <div className="mt-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                          <span className="font-semibold text-emerald-400 block mb-0.5">
                            Candidate's Approach / Solution:
                          </span>
                          <p className="leading-relaxed">{q.answerApproach}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
