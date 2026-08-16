import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { DifficultyBadge, OutcomeBadge } from '../components/ui/Badge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building2,
  User,
  Calendar,
  Layers,
  History,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isModerator, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'reports' | 'audit'>('submissions');

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'submissions') {
        const res: any = await api.get('/admin/submissions?status=PENDING_REVIEW');
        if (res.success) setSubmissions(res.data);
      } else if (activeTab === 'reports') {
        const res: any = await api.get('/admin/reports?status=OPEN');
        if (res.success) setReports(res.data);
      } else if (activeTab === 'audit') {
        const res: any = await api.get('/admin/audit-logs');
        if (res.success) setAuditLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    try {
      const res: any = await api.patch(`/admin/submissions/${id}/review`, {
        status: 'APPROVED',
      });
      if (res.success) {
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert('Error approving submission');
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      const res: any = await api.patch(`/admin/submissions/${rejectingId}/review`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'Content does not meet quality guidelines.',
      });
      if (res.success) {
        setSubmissions((prev) => prev.filter((item) => item.id !== rejectingId));
        setRejectingId(null);
        setRejectionReason('');
      }
    } catch (err) {
      alert('Error rejecting submission');
    }
  };

  const handleResolveReport = async (reportId: string, action: 'DELETE_CONTENT' | 'DISMISS') => {
    try {
      const res: any = await api.patch(`/admin/reports/${reportId}/resolve`, {
        status: 'RESOLVED',
        action,
        resolutionNotes: `Report resolved with action: ${action}`,
      });
      if (res.success) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (err) {
      alert('Error resolving report');
    }
  };

  if (!isModerator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400 mt-2">
          Moderator or administrator privileges are required to access this portal.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-800 text-amber-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Campus Moderation Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Moderation & Quality Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review peer-submitted placement reports, verify interview questions, and resolve community reports.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Pending Submissions ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Flagged Reports ({reports.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Audit Logs
          </button>
        )}
      </div>

      {/* Submissions Queue */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
              ))}
            </div>
          ) : submissions.length > 0 ? (
            submissions.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.company?.name} — {item.roleTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Submitted by: <strong>{item.user?.fullName}</strong> ({item.user?.collegeName})</span>
                      <span>•</span>
                      <span>Batch {item.batchYear}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <OutcomeBadge outcome={item.outcome} />
                    <DifficultyBadge difficulty={item.overallDifficulty} />
                  </div>
                </div>

                <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line">
                  {item.overview}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setRejectingId(item.id)}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject Submission
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleApprove(item.id)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Approve & Publish
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 glass-panel rounded-xl border border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">All caught up!</h3>
              <p className="text-xs text-slate-400 mt-1">No pending interview submissions in review queue.</p>
            </div>
          )}
        </div>
      )}

      {/* Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
                      Reason: {report.reason}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">
                      Reported by {report.reporter?.fullName} on{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {report.details && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    "{report.details}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveReport(report.id, 'DISMISS')}
                  >
                    Dismiss Report
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleResolveReport(report.id, 'DELETE_CONTENT')}
                  >
                    Remove Content
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 glass-panel rounded-xl border border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No active reports</h3>
              <p className="text-xs text-slate-400 mt-1">Platform guidelines are currently clean.</p>
            </div>
          )}
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Moderator</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="p-3.5 font-mono text-indigo-300">{log.action}</td>
                  <td className="p-3.5 font-semibold text-white">{log.actor?.fullName || 'System'}</td>
                  <td className="p-3.5">{log.targetEntity}</td>
                  <td className="p-3.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No audit records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Feedback Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Reason for Rejection</h3>
            <p className="text-xs text-slate-400">
              Provide actionable feedback for the student to revise their submission.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please elaborate on the technical questions asked in round 2."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />

            <div className="flex justify-end gap-3">
              <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
