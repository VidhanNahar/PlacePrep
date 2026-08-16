import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExperienceDTO } from '@placeprep/shared';
import { DifficultyBadge, OutcomeBadge } from '../ui/Badge';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Building2,
  Calendar,
  Layers,
  IndianRupee,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface ExperienceCardProps {
  experience: ExperienceDTO;
  onBookmarkChange?: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onBookmarkChange }) => {
  const { isAuthenticated } = useAuth();
  const [upvotes, setUpvotes] = useState(experience.upvoteCount);
  const [isUpvoted, setIsUpvoted] = useState(experience.isUpvotedByMe || false);
  const [isBookmarked, setIsBookmarked] = useState(experience.isBookmarkedByMe || false);
  const [isVoting, setIsVoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || isVoting) return;

    setIsVoting(true);
    try {
      const res: any = await api.post(`/experiences/${experience.id}/upvote`);
      if (res.success) {
        setIsUpvoted(res.data.upvoted);
        setUpvotes(res.data.upvoteCount);
      }
    } catch (err) {
      console.error('Error upvoting:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      const res: any = await api.post(`/experiences/${experience.id}/bookmark`);
      if (res.success) {
        setIsBookmarked(res.data.bookmarked);
        if (onBookmarkChange) onBookmarkChange();
      }
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 md:p-6 transition-all relative group flex flex-col justify-between">
      <div>
        {/* Header: Company & Metadata Badges */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
              {experience.companyLogoUrl ? (
                <img
                  src={experience.companyLogoUrl}
                  alt={experience.companyName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <Link
                to={`/experiences/${experience.id}`}
                className="text-base sm:text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1"
              >
                {experience.companyName} — {experience.roleTitle}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Batch {experience.batchYear} ({experience.expType.replace('_', ' ')})
                </span>
                {experience.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {experience.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <OutcomeBadge outcome={experience.outcome} />
            <DifficultyBadge difficulty={experience.overallDifficulty} />
          </div>
        </div>

        {/* Overview excerpt */}
        <p className="text-sm text-slate-300 line-clamp-2 mt-3 mb-4 leading-relaxed">
          {experience.overview}
        </p>

        {/* Highlight Stats Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 py-2.5 px-3 rounded-lg bg-slate-900/60 border border-slate-800/80 mb-4">
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            {experience.totalRounds} Rounds
          </span>
          {experience.compensationCtc && (
            <>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <IndianRupee className="w-3.5 h-3.5" />
                {experience.compensationCtc} LPA CTC
              </span>
            </>
          )}
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            By {experience.authorName || 'Student'} ({experience.authorCollege || 'Campus'})
          </span>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-4">
          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              isUpvoted
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title={isAuthenticated ? 'Upvote experience' : 'Sign in to upvote'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-indigo-400 text-indigo-400' : ''}`} />
            <span>{upvotes}</span>
          </button>

          {/* Comments count */}
          <span className="flex items-center gap-1 text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />
            {experience.commentCount}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={!isAuthenticated}
            className={`p-1 rounded-md transition-colors ${
              isBookmarked
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title={isAuthenticated ? 'Save bookmark' : 'Sign in to bookmark'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* View Full Experience Link */}
        <Link
          to={`/experiences/${experience.id}`}
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium group-hover:translate-x-0.5 transition-transform"
        >
          View Full Breakdown
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
