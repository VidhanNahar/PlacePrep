import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ExperienceDTO, CommentDTO } from '@placeprep/shared';
import { DifficultyBadge, OutcomeBadge } from '../components/ui/Badge';
import { RoundTimeline } from '../components/experiences/RoundTimeline';
import { Button } from '../components/ui/Button';
import { ReportModal } from '../components/modals/ReportModal';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Calendar,
  Layers,
  IndianRupee,
  MapPin,
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Share2,
  AlertTriangle,
  Lightbulb,
  Send,
  User,
  ArrowLeft,
} from 'lucide-react';

export const ExperienceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [experience, setExperience] = useState<ExperienceDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      setIsLoading(true);
      try {
        const [expRes, comRes]: any = await Promise.all([
          api.get(`/experiences/${id}`),
          api.get(`/comments/experience/${id}`),
        ]);

        if (expRes.success) {
          setExperience(expRes.data);
          setIsUpvoted(expRes.data.isUpvotedByMe || false);
          setUpvotes(expRes.data.upvoteCount || 0);
          setIsBookmarked(expRes.data.isBookmarkedByMe || false);
        }
        if (comRes.success) {
          setComments(comRes.data);
        }
      } catch (err) {
        console.error('Error fetching experience detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchExperience();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated || !experience) return;
    try {
      const res: any = await api.post(`/experiences/${experience.id}/upvote`);
      if (res.success) {
        setIsUpvoted(res.data.upvoted);
        setUpvotes(res.data.upvoteCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated || !experience) return;
    try {
      const res: any = await api.post(`/experiences/${experience.id}/bookmark`);
      if (res.success) {
        setIsBookmarked(res.data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !experience) return;

    setIsSubmittingComment(true);
    try {
      const res: any = await api.post(`/comments/experience/${experience.id}`, {
        content: newComment,
      });
      if (res.success) {
        setComments([res.data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-900 rounded w-1/3" />
        <div className="h-64 bg-slate-900 rounded-xl" />
        <div className="h-96 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Experience not found</h2>
        <p className="text-sm text-slate-400 mt-2">The requested placement experience does not exist.</p>
        <Link to="/experiences" className="mt-4 inline-block">
          <Button size="sm">Back to Experiences</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back link */}
      <Link
        to="/experiences"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Experiences
      </Link>

      {/* Main Experience Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 flex-shrink-0">
              {experience.companyLogoUrl ? (
                <img
                  src={experience.companyLogoUrl}
                  alt={experience.companyName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-indigo-400" />
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {experience.companyName}
              </h1>
              <p className="text-base sm:text-lg font-semibold text-indigo-300 mt-0.5">
                {experience.roleTitle}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Batch {experience.batchYear} ({experience.expType.replace('_', ' ')})
                </span>
                {experience.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {experience.location}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="text-slate-400">
                  Shared by <strong className="text-slate-200">{experience.authorName}</strong> ({experience.authorCollege})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <OutcomeBadge outcome={experience.outcome} />
            <DifficultyBadge difficulty={experience.overallDifficulty} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Interview Rounds</span>
            <span className="text-lg font-bold text-white font-mono flex items-center justify-center gap-1">
              <Layers className="w-4 h-4 text-indigo-400" />
              {experience.totalRounds}
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Compensation (CTC)</span>
            <span className="text-lg font-bold text-emerald-400 font-mono flex items-center justify-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {experience.compensationCtc ? `${experience.compensationCtc} LPA` : 'Undisclosed'}
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 block mb-1">Placement Cycle</span>
            <span className="text-lg font-bold text-slate-200 font-mono">
              {experience.placementCycleYear}
            </span>
          </div>
        </div>

        {/* Interactive Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={isUpvoted ? 'primary' : 'outline'}
              onClick={handleUpvote}
              disabled={!isAuthenticated}
              leftIcon={<ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />}
            >
              {upvotes} {upvotes === 1 ? 'Upvote' : 'Upvotes'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleBookmark}
              disabled={!isAuthenticated}
              leftIcon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />}
            >
              {isBookmarked ? 'Saved' : 'Bookmark'}
            </Button>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Report
          </button>
        </div>
      </div>

      {/* Recruitment Process Overview */}
      <section className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Recruitment Process Overview
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {experience.overview}
        </p>

        {experience.preparationTips && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              Candidate's Preparation & Strategy Tips
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {experience.preparationTips}
            </p>
          </div>
        )}
      </section>

      {/* Detailed Interview Rounds Breakdown */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Interview Rounds & Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological breakdown of each technical and HR stage
          </p>
        </div>

        <RoundTimeline rounds={experience.rounds || []} />
      </section>

      {/* Comments & Discussion Section */}
      <section className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Community Discussion ({comments.length})
          </h3>
        </div>

        {/* Comment input */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or share your thoughts with the author..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmittingComment}
                disabled={!newComment.trim()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400">
            Sign in to leave a question or comment for the author.
          </div>
        )}

        {/* Comment list */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-[10px] text-indigo-300">
                    {comment.userName.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-200">{comment.userName}</span>
                  <span className="text-slate-500">• {comment.userCollege}</span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-300 pl-8 leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-4">No comments yet. Start the conversation!</p>
          )}
        </div>
      </section>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        experienceId={experience.id}
      />
    </div>
  );
};
